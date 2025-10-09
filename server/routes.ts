import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth } from "./auth";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  
  // Create user profile after Supabase signup
  app.post("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const { fullName, email } = req.body;
      const userId = req.user!.id;

      // Check if user profile already exists
      const existingUser = await storage.getUser(userId);
      if (existingUser) {
        return res.json(existingUser);
      }

      // Create user profile
      const user = await storage.createUser({
        id: userId,
        fullName,
        email: email || req.user!.email,
        avatarUrl: null,
        familyId: null,
        role: "parent",
      });

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get current user's profile
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User profile not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Family onboarding routes

  // Create a new family
  app.post("/api/families", requireAuth, async (req, res) => {
    try {
      const { name } = req.body;
      const userId = req.user!.id;

      // Generate unique invite code
      const inviteCode = randomBytes(4).toString('hex').toUpperCase();

      // Create family
      const family = await storage.createFamily({
        name,
        inviteCode,
      });

      // Update user's family
      await storage.updateUser(userId, { familyId: family.id });

      res.json(family);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Join family by invite code
  app.post("/api/families/join", requireAuth, async (req, res) => {
    try {
      const { inviteCode } = req.body;
      const userId = req.user!.id;

      // Find family by invite code
      const family = await storage.getFamilyByInviteCode(inviteCode);
      if (!family) {
        return res.status(404).json({ message: "Invalid invite code" });
      }

      // Update user's family
      await storage.updateUser(userId, { familyId: family.id });

      res.json(family);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get current user's family
  app.get("/api/families/current", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const family = await storage.getFamily(user.familyId);
      res.json(family);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Family member routes

  // Get family members
  app.get("/api/family-members", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const members = await storage.getFamilyMembers(user.familyId);
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create family member
  app.post("/api/family-members", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const member = await storage.createFamilyMember({
        ...req.body,
        familyId: user.familyId,
      });

      res.json(member);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update family member
  app.patch("/api/family-members/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const member = await storage.updateFamilyMember(id, req.body);
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete family member
  app.delete("/api/family-members/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFamilyMember(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
