import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth } from "./auth";
import { randomBytes } from "crypto";
import * as googleCalendar from "./google-calendar";

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

      // Validate request body
      const validated = schema.insertFamilyMemberSchema.parse(req.body);

      const member = await storage.createFamilyMember({
        ...validated,
        familyId: user.familyId,
      });

      res.json(member);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update family member
  app.patch("/api/family-members/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      // Verify member belongs to user's family
      const existingMember = await storage.getFamilyMember(id);
      if (!existingMember) {
        return res.status(404).json({ message: "Family member not found" });
      }
      if (existingMember.familyId !== user.familyId) {
        return res.status(403).json({ message: "Not authorized to update this member" });
      }

      // Validate request body (partial update)
      const validated = schema.insertFamilyMemberSchema.partial().parse(req.body);
      
      // Remove protected fields that should not be modified by clients
      const { familyId, ...safeUpdate } = validated;

      const member = await storage.updateFamilyMember(id, safeUpdate);
      res.json(member);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Delete family member
  app.delete("/api/family-members/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      // Verify member belongs to user's family
      const existingMember = await storage.getFamilyMember(id);
      if (!existingMember) {
        return res.status(404).json({ message: "Family member not found" });
      }
      if (existingMember.familyId !== user.familyId) {
        return res.status(403).json({ message: "Not authorized to delete this member" });
      }

      await storage.deleteFamilyMember(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Calendar routes
  
  // Get calendar connections for current user
  app.get("/api/calendar-connections", requireAuth, async (req, res) => {
    try {
      const connections = await storage.getCalendarConnections(req.user!.id);
      res.json(connections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Connect Google Calendar
  app.post("/api/calendar-connections/google", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      // Get calendar email from Google
      const email = await googleCalendar.getCalendarEmail();
      
      // Create calendar connection record
      const connection = await storage.createCalendarConnection({
        userId: req.user!.id,
        googleAccountEmail: email,
        accessToken: "managed_by_replit",
        refreshToken: null,
        expiresAt: null,
        lastSyncedAt: null,
        syncStatus: "active",
      });

      res.json(connection);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Sync events from Google Calendar
  app.post("/api/calendar-connections/:id/sync", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user!.id);
      
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const connection = await storage.getCalendarConnection(id);
      if (!connection || connection.userId !== req.user!.id) {
        return res.status(404).json({ message: "Calendar connection not found" });
      }

      // Sync events from Google Calendar
      const googleEvents = await googleCalendar.syncCalendarEvents(req.user!.id, user.familyId);
      
      // Store events in database
      const storedEvents = [];
      for (const eventData of googleEvents) {
        // Check if event already exists
        const existing = await storage.getEventByGoogleId(eventData.googleEventId!);
        if (!existing) {
          const event = await storage.createEvent({
            ...eventData,
            calendarConnectionId: id,
          });
          storedEvents.push(event);
        }
      }

      // Update last synced time
      await storage.updateCalendarConnection(id, {
        lastSyncedAt: new Date(),
      });

      res.json({ 
        success: true, 
        syncedCount: storedEvents.length,
        totalEvents: googleEvents.length 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete calendar connection
  app.delete("/api/calendar-connections/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await storage.getCalendarConnection(id);
      
      if (!connection || connection.userId !== req.user!.id) {
        return res.status(404).json({ message: "Calendar connection not found" });
      }

      await storage.deleteCalendarConnection(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // List routes
  
  // Get all lists for family
  app.get("/api/lists", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const lists = await storage.getListsByFamily(user.familyId);
      res.json(lists);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create list
  app.post("/api/lists", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const validated = schema.insertListSchema.parse(req.body);
      const list = await storage.createList({
        ...validated,
        familyId: user.familyId,
      });

      res.json(list);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Delete list
  app.delete("/api/lists/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const list = await storage.getList(id);
      if (!list || list.familyId !== user.familyId) {
        return res.status(404).json({ message: "List not found" });
      }

      await storage.deleteList(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get list items
  app.get("/api/lists/:listId/items", requireAuth, async (req, res) => {
    try {
      const { listId } = req.params;
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const list = await storage.getList(listId);
      if (!list || list.familyId !== user.familyId) {
        return res.status(404).json({ message: "List not found" });
      }

      const items = await storage.getListItems(listId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create list item
  app.post("/api/lists/:listId/items", requireAuth, async (req, res) => {
    try {
      const { listId } = req.params;
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const list = await storage.getList(listId);
      if (!list || list.familyId !== user.familyId) {
        return res.status(404).json({ message: "List not found" });
      }

      const validated = schema.insertListItemSchema.parse(req.body);
      const item = await storage.createListItem({
        ...validated,
        listId,
      });

      res.json(item);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update list item
  app.patch("/api/lists/:listId/items/:id", requireAuth, async (req, res) => {
    try {
      const { listId, id } = req.params;
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const list = await storage.getList(listId);
      if (!list || list.familyId !== user.familyId) {
        return res.status(404).json({ message: "List not found" });
      }

      const item = await storage.getListItem(id);
      if (!item || item.listId !== listId) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Convert ISO string dates to Date objects before validation
      const payload = { ...req.body };
      if (payload.purchasedAt && typeof payload.purchasedAt === 'string') {
        payload.purchasedAt = new Date(payload.purchasedAt);
      }

      const validated = schema.insertListItemSchema.partial().parse(payload);
      const { listId: _, ...safeUpdate } = validated;

      const updatedItem = await storage.updateListItem(id, safeUpdate);
      res.json(updatedItem);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Delete list item
  app.delete("/api/lists/:listId/items/:id", requireAuth, async (req, res) => {
    try {
      const { listId, id } = req.params;
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const list = await storage.getList(listId);
      if (!list || list.familyId !== user.familyId) {
        return res.status(404).json({ message: "List not found" });
      }

      const item = await storage.getListItem(id);
      if (!item || item.listId !== listId) {
        return res.status(404).json({ message: "Item not found" });
      }

      await storage.deleteListItem(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Chore routes

  // Get all chores for family
  app.get("/api/chores", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const chores = await storage.getChoresByFamily(user.familyId);
      res.json(chores);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create chore
  app.post("/api/chores", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const validated = schema.insertChoreSchema.parse(req.body);
      const chore = await storage.createChore({
        ...validated,
        familyId: user.familyId,
      });

      res.json(chore);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update chore
  app.patch("/api/chores/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const chore = await storage.getChore(id);
      if (!chore || chore.familyId !== user.familyId) {
        return res.status(404).json({ message: "Chore not found" });
      }

      const validated = schema.insertChoreSchema.partial().parse(req.body);
      const { familyId: _, ...safeUpdate } = validated;

      const updatedChore = await storage.updateChore(id, safeUpdate);
      res.json(updatedChore);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Delete chore
  app.delete("/api/chores/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const chore = await storage.getChore(id);
      if (!chore || chore.familyId !== user.familyId) {
        return res.status(404).json({ message: "Chore not found" });
      }

      await storage.deleteChore(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Complete chore
  app.post("/api/chores/:id/complete", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const chore = await storage.getChore(id);
      if (!chore || chore.familyId !== user.familyId) {
        return res.status(404).json({ message: "Chore not found" });
      }

      const validated = schema.insertChoreCompletionSchema.parse(req.body);
      const completion = await storage.completeChore({
        ...validated,
        choreId: id,
      });

      res.json(completion);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Get chore completions
  app.get("/api/chores/:id/completions", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const chore = await storage.getChore(id);
      if (!chore || chore.familyId !== user.familyId) {
        return res.status(404).json({ message: "Chore not found" });
      }

      const completions = await storage.getChoreCompletions(id);
      res.json(completions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
