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

  const httpServer = createServer(app);

  return httpServer;
}
