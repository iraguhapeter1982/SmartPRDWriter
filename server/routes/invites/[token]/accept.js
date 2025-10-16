import { supabase } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;
  const { userId, email } = req.body;

  try {
    const authToken = req.headers.authorization?.split(' ')[1];
    if (!authToken) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Create service role client for admin operations
    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Validate invitation token
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('family_invitations')
      .select('*, families(name)')
      .eq('token', token)
      .eq('email', email)
      .eq('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      return res.status(400).json({ 
        error: 'Invalid or expired invitation',
        details: 'This invitation link is invalid, expired, or not meant for this email address.'
      });
    }

    // Check if user already exists in this family
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('family_id')
      .eq('id', userId)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      throw userCheckError;
    }

    if (existingUser) {
      if (existingUser.family_id === invite.family_id) {
        return res.status(400).json({ error: 'You are already a member of this family' });
      } else {
        return res.status(400).json({ error: 'You are already a member of another family' });
      }
    }

    // Create user record with family_id from invitation
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email,
        full_name: email.split('@')[0], // Use email prefix as default name
        family_id: invite.family_id,
        role: 'parent'
      });

    if (userError) throw userError;

    // Mark invitation as accepted
    const { error: acceptError } = await supabaseAdmin
      .from('family_invitations')
      .update({
        accepted_at: new Date().toISOString(),
        accepted_by: userId
      })
      .eq('id', invite.id);

    if (acceptError) throw acceptError;

    res.status(200).json({ 
      success: true, 
      familyId: invite.family_id,
      familyName: invite.families.name,
      message: `Successfully joined ${invite.families.name}` 
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}