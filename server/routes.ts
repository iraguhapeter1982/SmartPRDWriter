import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth } from "./auth";
import { randomBytes } from "crypto";
import * as googleCalendar from "./google-calendar";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
if (!process.env.STRIPE_PRICE_ID) {
  console.warn('WARNING: STRIPE_PRICE_ID is not set. Subscription creation will fail.');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

  // Message routes
  
  // Get all messages for family
  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const messages = await storage.getMessagesByFamily(user.familyId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Mark message as read
  app.patch("/api/messages/:id/read", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.familyId) {
        return res.status(404).json({ message: "No family found" });
      }

      const message = await storage.markMessageAsRead(id);
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Webhook for receiving school messages (no auth required for external services)
  app.post("/api/webhooks/messages/:familyId", async (req, res) => {
    try {
      const { familyId } = req.params;
      const { subject, sender, senderEmail, body, preview, isUrgent } = req.body;

      // Verify family exists
      const family = await storage.getFamily(familyId);
      if (!family) {
        return res.status(404).json({ message: "Family not found" });
      }

      // Create message
      const message = await storage.createMessage({
        familyId,
        subject: subject || 'No Subject',
        sender: sender || null,
        senderEmail: senderEmail || null,
        body: body || null,
        preview: preview || body?.substring(0, 150) || null,
        isUrgent: isUrgent || false,
        isRead: false,
      });

      res.json({ success: true, message });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe subscription routes

  // Get or create subscription for current user's family
  app.post('/api/subscription/create', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user?.familyId) {
        return res.status(400).json({ message: "User must belong to a family" });
      }

      // Check if family already has an active subscription
      const existingSubscription = await storage.getSubscriptionByFamily(user.familyId);
      
      if (existingSubscription?.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(existingSubscription.stripeSubscriptionId);
        
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          const latestInvoice = subscription.latest_invoice;
          const paymentIntent = typeof latestInvoice === 'string' 
            ? null 
            : latestInvoice?.payment_intent;
          const clientSecret = typeof paymentIntent === 'string' 
            ? null 
            : paymentIntent?.client_secret;

          return res.json({
            subscriptionId: subscription.id,
            clientSecret: clientSecret,
            status: subscription.status,
          });
        }
      }

      // Create Stripe customer if needed
      let stripeCustomerId = existingSubscription?.stripeCustomerId;
      
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: user.fullName || undefined,
          metadata: {
            familyId: user.familyId,
            userId: user.id,
          },
        });
        stripeCustomerId = customer.id;
      }

      // Validate STRIPE_PRICE_ID before creating subscription
      if (!process.env.STRIPE_PRICE_ID) {
        return res.status(500).json({ 
          message: 'STRIPE_PRICE_ID is not configured. Please contact support.' 
        });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
          price: process.env.STRIPE_PRICE_ID,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      const latestInvoice = subscription.latest_invoice;
      const paymentIntent = typeof latestInvoice === 'string' 
        ? null 
        : latestInvoice?.payment_intent;
      const clientSecret = typeof paymentIntent === 'string' 
        ? null 
        : paymentIntent?.client_secret;

      // Save or update subscription in database
      if (existingSubscription) {
        await storage.updateSubscription(existingSubscription.id, {
          stripeCustomerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: process.env.STRIPE_PRICE_ID || null,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
          currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
        });
      } else {
        await storage.createSubscription({
          familyId: user.familyId,
          userId: user.id,
          stripeCustomerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: process.env.STRIPE_PRICE_ID || null,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
          currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
          cancelAtPeriodEnd: false,
        });
      }

      res.json({
        subscriptionId: subscription.id,
        clientSecret,
        status: subscription.status,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get subscription status for current user's family
  app.get('/api/subscription/status', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      
      if (!user?.familyId) {
        return res.json({ hasSubscription: false, status: 'inactive' });
      }

      const subscription = await storage.getSubscriptionByFamily(user.familyId);
      
      if (!subscription?.stripeSubscriptionId) {
        return res.json({ hasSubscription: false, status: 'inactive' });
      }

      // Get latest status from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      
      // Update local database with latest status
      await storage.updateSubscription(subscription.id, {
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      });

      res.json({
        hasSubscription: true,
        status: stripeSubscription.status,
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe webhook for handling events
  app.post('/api/webhooks/stripe', async (req: any, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).send('No signature');
    }

    // Stripe webhook signature verification requires STRIPE_WEBHOOK_SECRET
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      // Use raw body for signature verification
      const rawBody = req.rawBody || JSON.stringify(req.body);
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const dbSubscription = await storage.getSubscriptionByStripeId(subscription.id);
          
          if (dbSubscription) {
            await storage.updateSubscription(dbSubscription.id, {
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            });
          }
          break;
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            const subscriptionId = typeof invoice.subscription === 'string' 
              ? invoice.subscription 
              : invoice.subscription.id;
            const dbSubscription = await storage.getSubscriptionByStripeId(subscriptionId);
            
            if (dbSubscription) {
              await storage.updateSubscription(dbSubscription.id, {
                status: 'active',
              });
            }
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            const subscriptionId = typeof invoice.subscription === 'string' 
              ? invoice.subscription 
              : invoice.subscription.id;
            const dbSubscription = await storage.getSubscriptionByStripeId(subscriptionId);
            
            if (dbSubscription) {
              await storage.updateSubscription(dbSubscription.id, {
                status: 'past_due',
              });
            }
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
