import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  try {
    // Create service role client for admin operations
    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Validate invitation token
    const { data: invite, error } = await supabaseAdmin
      .from('family_invitations')
      .select(`
        id,
        email,
        expires_at,
        accepted_at,
        families (
          id,
          name
        )
      `)
      .eq('token', token)
      .single();

    if (error || !invite) {
      return res.status(404).json({ 
        error: 'Invitation not found',
        details: 'This invitation link is invalid or does not exist.'
      });
    }

    // Check if already accepted
    if (invite.accepted_at) {
      return res.status(400).json({ 
        error: 'Invitation already accepted',
        details: 'This invitation has already been used.'
      });
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({ 
        error: 'Invitation expired',
        details: 'This invitation link has expired.'
      });
    }

    // Return valid invitation data
    res.status(200).json({
      invite: {
        id: invite.id,
        email: invite.email,
        expires_at: invite.expires_at
      },
      family: {
        id: invite.families.id,
        name: invite.families.name
      }
    });

  } catch (error) {
    console.error('Invite validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}