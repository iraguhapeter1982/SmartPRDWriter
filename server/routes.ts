import type { Express } from "express";
import { createServer, type Server } from "http";

import { requireAuth, type AuthRequest } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {


  // Get user's families
  app.get("/api/families", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      console.log('Fetching families for user:', userId);

      // Use Supabase client directly
      const { supabaseAdmin } = await import("./supabase");
      
      // Get user record which contains family_id
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('User lookup result:', user, userError);

      // If user doesn't exist in our users table, create them
      if (userError && userError.code === 'PGRST116') {
        console.log('User not found in users table, creating...');
        
        // Get user info from Supabase auth
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (!authUser?.user) {
          throw new Error('User not found in auth');
        }

        // Create user record without family
        const { data: newUser, error: createUserError } = await supabaseAdmin
          .from('users')
          .insert({
            id: userId,
            email: authUser.user.email,
            full_name: authUser.user.user_metadata?.full_name || authUser.user.email,
            role: 'parent',
            family_id: null
          })
          .select()
          .single();

        if (createUserError) {
          console.error('Error creating user:', createUserError);
          throw createUserError;
        }

        console.log('New user created, no family yet');
        res.json([]);
        return;
      }

      if (userError) {
        throw userError;
      }

      // If user has no family, create a default family for them
      if (!user.family_id) {
        console.log('User has no family, creating default family...');
        
        // Create a default family
        const { data: newFamily, error: familyError } = await supabaseAdmin
          .from('families')
          .insert({
            name: `${user.full_name || user.email}'s Family`
          })
          .select()
          .single();

        if (familyError) {
          console.error('Error creating family:', familyError);
          throw familyError;
        }

        // Update user to assign them to the new family
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ family_id: newFamily.id })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user family:', updateError);
          throw updateError;
        }

        // Create family member record for the user
        const { error: memberError } = await supabaseAdmin
          .from('family_members')
          .insert({
            family_id: newFamily.id,
            name: user.full_name || user.email || 'Family Admin',
            role: 'parent',
            avatar_url: null
          });

        if (memberError) {
          console.error('Error creating family member:', memberError);
          // Don't throw here, as the main family creation succeeded
        }

        const result = [{
          family: newFamily,
          role: user.role
        }];
        
        console.log('Created and assigned default family:', result);
        res.json(result);
        return;
      }

      // Get the family
      const { data: family, error: familyError } = await supabaseAdmin
        .from('families')
        .select('*')
        .eq('id', user.family_id)
        .single();

      if (familyError) {
        console.error('Error fetching family:', familyError);
        throw familyError;
      }

      const result = [{
        family: family,
        role: user.role
      }];
      
      console.log('Found user family:', result);
      res.json(result);
      
    } catch (error: any) {
      console.error("Error fetching families:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get family members
  app.get("/api/family-members", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { supabaseAdmin } = await import("./supabase");

      // Get user's family_id
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('family_id')
        .eq('id', userId)
        .single();

      if (userError || !user.family_id) {
        return res.status(404).json({ error: "User has no family" });
      }

      // Get family members
      const { data: members, error: membersError } = await supabaseAdmin
        .from('family_members')
        .select('*')
        .eq('family_id', user.family_id)
        .order('created_at');

      if (membersError) {
        console.error('Error fetching family members:', membersError);
        throw membersError;
      }

      res.json(members || []);
    } catch (error: any) {
      console.error("Error fetching family members:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Complete onboarding - create family and setup user
  app.post("/api/auth/complete-onboarding", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { familyName, familyMembers, isNewFamily } = req.body;

      if (!familyName) {
        return res.status(400).json({ error: "Family name is required" });
      }

      const { supabaseAdmin } = await import("./supabase");

      // Start a transaction-like operation
      try {
        // 1. Create the family
        const { data: family, error: familyError } = await supabaseAdmin
          .from('families')
          .insert([{
            name: familyName,
            created_by: userId
          }])
          .select()
          .single();

        if (familyError) throw familyError;

        // 2. Update user with family_id and role
        const { error: userUpdateError } = await supabaseAdmin
          .from('users')
          .update({ 
            family_id: family.id,
            role: 'parent'
          })
          .eq('id', userId);

        if (userUpdateError) throw userUpdateError;

        // 3. Create family members if provided
        if (familyMembers && familyMembers.length > 0) {
          const membersToInsert = familyMembers.map((member: any) => ({
            family_id: family.id,
            name: member.name,
            role: member.role,
            email: member.email || null,
            added_by: userId
          }));

          const { error: membersError } = await supabaseAdmin
            .from('family_members')
            .insert(membersToInsert);

          if (membersError) throw membersError;
        }

        res.json({ 
          success: true, 
          family,
          message: "Onboarding completed successfully" 
        });

      } catch (transactionError) {
        // If any step fails, we should ideally rollback
        // For now, just throw the error
        throw transactionError;
      }

    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create family invite
  app.post("/api/invites", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { familyId, email } = req.body;

      if (!familyId || !email) {
        return res.status(400).json({ error: "Family ID and email are required" });
      }

      const { supabaseAdmin } = await import("./supabase");

      // Verify user belongs to the family
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('family_id, role')
        .eq('id', userId)
        .single();

      if (userError || user.family_id !== familyId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Generate a unique token
      const crypto = await import('crypto');
      const token = crypto.randomUUID();
      
      // Create the invite
      const { data: invite, error: inviteError } = await supabaseAdmin
        .from('family_invites')
        .insert({
          family_id: familyId,
          email: email,
          token: token,
          invited_by: userId,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        })
        .select()
        .single();

      if (inviteError) {
        console.error('Error creating invite:', inviteError);
        throw inviteError;
      }

      res.json(invite);
    } catch (error: any) {
      console.error("Error creating invite:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get invite by token (for validation)
  app.get("/api/invites/:token", async (req, res) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }

      const { supabaseAdmin } = await import("./supabase");

      // Get the invite with family information
      const { data: invite, error: inviteError } = await supabaseAdmin
        .from('family_invites')
        .select(`
          *,
          family:families(*)
        `)
        .eq('token', token)
        .eq('accepted', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (inviteError || !invite) {
        return res.status(404).json({ 
          error: "Invalid or expired invite",
          details: inviteError?.message 
        });
      }

      res.json({
        invite: invite,
        family: invite.family
      });
    } catch (error: any) {
      console.error("Error validating invite:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Accept invite
  app.post("/api/invites/:token/accept", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { token } = req.params;
      const { email } = req.body;
      const userId = req.userId!;

      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }

      const { supabaseAdmin } = await import("./supabase");

      // Get the invite
      const { data: invite, error: inviteError } = await supabaseAdmin
        .from('family_invites')
        .select('*')
        .eq('token', token)
        .eq('accepted', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (inviteError || !invite) {
        return res.status(404).json({ error: "Invalid or expired invite" });
      }

      // Verify email matches
      if (email && invite.email !== email) {
        return res.status(403).json({ error: "Email mismatch" });
      }

      // Get user info for family member creation
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (!authUser?.user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user's family
      const { error: updateUserError } = await supabaseAdmin
        .from('users')
        .update({ family_id: invite.family_id })
        .eq('id', userId);

      if (updateUserError) {
        console.error('Error updating user family:', updateUserError);
        throw updateUserError;
      }

      // Create family member record for the new user
      const { error: memberError } = await supabaseAdmin
        .from('family_members')
        .insert({
          family_id: invite.family_id,
          name: authUser.user.user_metadata?.full_name || authUser.user.email || 'New Member',
          role: 'parent', // Default role for invited users
          avatar_url: authUser.user.user_metadata?.avatar_url || null
        });

      if (memberError) {
        console.error('Error creating family member:', memberError);
        // Don't throw here, as the main invitation acceptance succeeded
      }

      // Mark invite as accepted
      const { error: acceptError } = await supabaseAdmin
        .from('family_invites')
        .update({ 
          accepted: true, 
          accepted_at: new Date().toISOString() 
        })
        .eq('token', token);

      if (acceptError) {
        console.error('Error accepting invite:', acceptError);
        throw acceptError;
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error accepting invite:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
