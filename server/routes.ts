import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { families, familyMembers, familyInvites } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { supabaseAdmin } from "./supabase";
import { requireAuth, type AuthRequest } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a family (called after signup)
  app.post("/api/families", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { name } = req.body;
      const userId = req.userId!;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      const [family] = await db
        .insert(families)
        .values({
          name,
          createdBy: userId,
        })
        .returning();

      await db.insert(familyMembers).values({
        familyId: family.id,
        userId: userId,
        role: "owner",
      });

      res.json(family);
    } catch (error: any) {
      console.error("Error creating family:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's families
  app.get("/api/families", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;

      const userFamilies = await db
        .select({
          family: families,
          role: familyMembers.role,
        })
        .from(familyMembers)
        .innerJoin(families, eq(familyMembers.familyId, families.id))
        .where(eq(familyMembers.userId, userId));

      res.json(userFamilies);
    } catch (error: any) {
      console.error("Error fetching families:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Send invite
  app.post("/api/invites", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { familyId, email } = req.body;
      const userId = req.userId!;

      if (!familyId || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify user is a member of the family
      const [membership] = await db
        .select()
        .from(familyMembers)
        .where(
          and(
            eq(familyMembers.familyId, familyId),
            eq(familyMembers.userId, userId)
          )
        );

      if (!membership) {
        return res.status(403).json({ error: "Not authorized to invite to this family" });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const [invite] = await db
        .insert(familyInvites)
        .values({
          familyId,
          email,
          invitedBy: userId,
          expiresAt,
        })
        .returning();

      res.json(invite);
    } catch (error: any) {
      console.error("Error creating invite:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get invite by token (public endpoint for pre-signup invite viewing)
  app.get("/api/invites/:token", async (req, res) => {
    try {
      const { token } = req.params;

      const [invite] = await db
        .select()
        .from(familyInvites)
        .where(
          and(
            eq(familyInvites.token, token),
            eq(familyInvites.status, "pending")
          )
        );

      if (!invite || new Date(invite.expiresAt) < new Date()) {
        return res.status(404).json({ error: "Invalid or expired invite" });
      }

      const [family] = await db
        .select()
        .from(families)
        .where(eq(families.id, invite.familyId));

      // Return limited data for public viewing
      res.json({ 
        invite: {
          email: invite.email,
          familyId: invite.familyId,
          expiresAt: invite.expiresAt,
        },
        family: {
          name: family?.name,
        }
      });
    } catch (error: any) {
      console.error("Error fetching invite:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Accept invite
  app.post("/api/invites/:token/accept", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { token } = req.params;
      const userId = req.userId!;

      const [invite] = await db
        .select()
        .from(familyInvites)
        .where(
          and(
            eq(familyInvites.token, token),
            eq(familyInvites.status, "pending")
          )
        );

      if (!invite || new Date(invite.expiresAt) < new Date()) {
        return res.status(404).json({ error: "Invalid or expired invite" });
      }

      // Get the authenticated user's email from Supabase
      const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (userError || !user) {
        return res.status(401).json({ error: "Failed to verify user" });
      }

      // Verify the user's email matches the invite email
      if (user.email !== invite.email) {
        return res.status(403).json({ error: "This invite was sent to a different email address" });
      }

      // Check if user is already a member
      const [existingMember] = await db
        .select()
        .from(familyMembers)
        .where(
          and(
            eq(familyMembers.familyId, invite.familyId),
            eq(familyMembers.userId, userId)
          )
        );

      if (existingMember) {
        return res.status(400).json({ error: "Already a member of this family" });
      }

      await db.insert(familyMembers).values({
        familyId: invite.familyId,
        userId: userId,
        role: "member",
      });

      await db
        .update(familyInvites)
        .set({ status: "accepted" })
        .where(eq(familyInvites.token, token));

      res.json({ success: true, familyId: invite.familyId });
    } catch (error: any) {
      console.error("Error accepting invite:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get family members
  app.get("/api/families/:familyId/members", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { familyId } = req.params;
      const userId = req.userId!;

      // Verify user is a member of the family
      const [membership] = await db
        .select()
        .from(familyMembers)
        .where(
          and(
            eq(familyMembers.familyId, familyId),
            eq(familyMembers.userId, userId)
          )
        );

      if (!membership) {
        return res.status(403).json({ error: "Not authorized to view this family" });
      }

      const members = await db
        .select()
        .from(familyMembers)
        .where(eq(familyMembers.familyId, familyId));

      res.json(members);
    } catch (error: any) {
      console.error("Error fetching family members:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get family invites
  app.get("/api/families/:familyId/invites", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { familyId } = req.params;
      const userId = req.userId!;

      // Verify user is a member of the family
      const [membership] = await db
        .select()
        .from(familyMembers)
        .where(
          and(
            eq(familyMembers.familyId, familyId),
            eq(familyMembers.userId, userId)
          )
        );

      if (!membership) {
        return res.status(403).json({ error: "Not authorized to view invites for this family" });
      }

      const invites = await db
        .select()
        .from(familyInvites)
        .where(eq(familyInvites.familyId, familyId));

      res.json(invites);
    } catch (error: any) {
      console.error("Error fetching invites:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
