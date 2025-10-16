import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, familyName, email, isNewFamily, inviteToken } = req.body;
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

    if (isNewFamily) {
      // Create new family
      const { data: family, error: familyError } = await supabaseAdmin
        .from('families')
        .insert({
          name: familyName
        })
        .select()
        .single();

      if (familyError) throw familyError;

      // Create user record
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: email,
          full_name: familyName + ' Admin',
          family_id: family.id,
          role: 'parent'
        });

      if (userError) throw userError;

      // Create a family member record for the admin
      const { error: memberError } = await supabaseAdmin
        .from('family_members')
        .insert({
          family_id: family.id,
          name: familyName + ' Admin',
          role: 'parent'
        });

      if (memberError) throw memberError;

      res.status(200).json({ 
        success: true, 
        familyId: family.id,
        message: 'Family created successfully' 
      });

    } else if (inviteToken) {
      // Handle invitation acceptance
      const { data: invite, error: inviteError } = await supabaseAdmin
        .from('family_invitations')
        .select('*, families(name)')
        .eq('token', inviteToken)
        .eq('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (inviteError || !invite) {
        return res.status(400).json({ error: 'Invalid or expired invitation' });
      }

      // Create user record with family_id from invitation
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: email,
          full_name: email.split('@')[0], // Use email prefix as name
          family_id: invite.family_id,
          role: 'parent'
        });

      if (userError) throw userError;

      // Mark invitation as accepted
      const { error: acceptError } = await supabaseAdmin
        .from('family_invitations')
        .update({
          accepted_at: new Date().toISOString()
        })
        .eq('id', invite.id);

      if (acceptError) throw acceptError;

      res.status(200).json({ 
        success: true, 
        familyId: invite.family_id,
        familyName: invite.families.name,
        message: 'Successfully joined family' 
      });
      
    } else {
      return res.status(400).json({ error: 'Invalid signup data' });
    }

  } catch (error) {
    console.error('Complete signup error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}