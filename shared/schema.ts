import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Families table
export const families = pgTable("families", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  inviteCode: text("invite_code").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users table - maps to Supabase auth.users
// The id MUST come from Supabase auth.users(id) and is enforced by the application layer
export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull(), // Must match Supabase auth.users(id)
  fullName: text("full_name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  familyId: uuid("family_id").references(() => families.id, { onDelete: "cascade" }),
  role: text("role").default("parent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Family members table (children + adults as personas)
export const familyMembers = pgTable("family_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: uuid("family_id").references(() => families.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  role: text("role"),
  birthYear: integer("birth_year"),
  avatarUrl: text("avatar_url"),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Calendar connections table
export const calendarConnections = pgTable("calendar_connections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  googleAccountEmail: text("google_account_email"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  lastSyncedAt: timestamp("last_synced_at"),
  syncStatus: text("sync_status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: uuid("family_id").references(() => families.id, { onDelete: "cascade" }).notNull(),
  calendarConnectionId: uuid("calendar_connection_id").references(() => calendarConnections.id, { onDelete: "cascade" }),
  googleEventId: text("google_event_id"),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  assignedMemberId: uuid("assigned_member_id").references(() => familyMembers.id),
  allDay: boolean("all_day").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lists table
export const lists = pgTable("lists", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: uuid("family_id").references(() => families.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  type: text("type").default("grocery"),
  createdAt: timestamp("created_at").defaultNow(),
});

// List items table
export const listItems = pgTable("list_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  listId: uuid("list_id").references(() => lists.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  purchased: boolean("purchased").default(false),
  assignedMemberId: uuid("assigned_member_id").references(() => familyMembers.id),
  createdAt: timestamp("created_at").defaultNow(),
  purchasedAt: timestamp("purchased_at"),
});

// Chores table
export const chores = pgTable("chores", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: uuid("family_id").references(() => families.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  assignedMemberId: uuid("assigned_member_id").references(() => familyMembers.id),
  points: integer("points").default(0),
  recurring: text("recurring"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chore completions table
export const choreCompletions = pgTable("chore_completions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  choreId: uuid("chore_id").references(() => chores.id, { onDelete: "cascade" }).notNull(),
  completedById: uuid("completed_by_id").references(() => familyMembers.id),
  completedAt: timestamp("completed_at").defaultNow(),
  notes: text("notes"),
});

// Messages table (School Hub)
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: uuid("family_id").references(() => families.id, { onDelete: "cascade" }).notNull(),
  subject: text("subject").notNull(),
  sender: text("sender"),
  senderEmail: text("sender_email"),
  body: text("body"),
  preview: text("preview"),
  isUrgent: boolean("is_urgent").default(false),
  isRead: boolean("is_read").default(false),
  receivedAt: timestamp("received_at").defaultNow(),
});

// Subscriptions table (Stripe) - family-level subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  familyId: uuid("family_id").references(() => families.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(), // User who owns the subscription
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  status: text("status").default("inactive"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas - users.id is required and must be from Supabase Auth
export const insertFamilySchema = createInsertSchema(families).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true }).required({ id: true });
export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({ id: true, createdAt: true });
export const insertCalendarConnectionSchema = createInsertSchema(calendarConnections).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertListSchema = createInsertSchema(lists).omit({ id: true, createdAt: true });
export const insertListItemSchema = createInsertSchema(listItems).omit({ id: true, createdAt: true, purchasedAt: true });
export const insertChoreSchema = createInsertSchema(chores).omit({ id: true, createdAt: true });
export const insertChoreCompletionSchema = createInsertSchema(choreCompletions).omit({ id: true, completedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, receivedAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type Family = typeof families.$inferSelect;
export type InsertFamily = z.infer<typeof insertFamilySchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type CalendarConnection = typeof calendarConnections.$inferSelect;
export type InsertCalendarConnection = z.infer<typeof insertCalendarConnectionSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type List = typeof lists.$inferSelect;
export type InsertList = z.infer<typeof insertListSchema>;
export type ListItem = typeof listItems.$inferSelect;
export type InsertListItem = z.infer<typeof insertListItemSchema>;
export type Chore = typeof chores.$inferSelect;
export type InsertChore = z.infer<typeof insertChoreSchema>;
export type ChoreCompletion = typeof choreCompletions.$inferSelect;
export type InsertChoreCompletion = z.infer<typeof insertChoreCompletionSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
