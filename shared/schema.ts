import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - maps to Supabase auth.users
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // References auth.users(id)
  fullName: text("full_name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  familyId: uuid("family_id").references(() => families.id, { onDelete: "cascade" }),
  role: text("role").default("parent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const families = pgTable("families", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  inviteCode: text("invite_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Family members table (children + adults as personas)
export const familyMembers = pgTable("family_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  birthYear: integer("birth_year"),
  avatarUrl: text("avatar_url"),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const familyInvites = pgTable("family_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  invitedBy: uuid("invited_by").notNull(),
  token: uuid("token").defaultRandom().notNull(),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Calendar connections table
export const calendarConnections = pgTable("calendar_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  googleAccountEmail: text("google_account_email"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  lastSyncedAt: timestamp("last_synced_at"),
  syncStatus: text("sync_status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Events table
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  calendarConnectionId: uuid("calendar_connection_id").references(() => calendarConnections.id, { onDelete: "cascade" }),
  googleEventId: text("google_event_id"),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  assignedMemberId: uuid("assigned_member_id").references(() => familyMembers.id),
  allDay: boolean("all_day").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Lists table
export const lists = pgTable("lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").default("grocery"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// List items table
export const listItems = pgTable("list_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  listId: uuid("list_id").notNull().references(() => lists.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  purchased: boolean("purchased").default(false),
  assignedMemberId: uuid("assigned_member_id").references(() => familyMembers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  purchasedAt: timestamp("purchased_at"),
});

// Chores table
export const chores = pgTable("chores", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  assignedMemberId: uuid("assigned_member_id").references(() => familyMembers.id),
  points: integer("points").default(0),
  recurring: text("recurring"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chore completions table
export const choreCompletions = pgTable("chore_completions", {
  id: uuid("id").primaryKey().defaultRandom(),
  choreId: uuid("chore_id").notNull().references(() => chores.id, { onDelete: "cascade" }),
  completedById: uuid("completed_by_id").references(() => familyMembers.id),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  notes: text("notes"),
});

// Messages table (School Hub)
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  sender: text("sender"),
  senderEmail: text("sender_email"),
  body: text("body"),
  preview: text("preview"),
  isUrgent: boolean("is_urgent").default(false),
  isRead: boolean("is_read").default(false),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
});

// Schema exports
export const insertFamilySchema = createInsertSchema(families);
export const insertFamilyMemberSchema = createInsertSchema(familyMembers);
export const insertFamilyInviteSchema = createInsertSchema(familyInvites);
export const insertUserSchema = createInsertSchema(users);
export const insertEventSchema = createInsertSchema(events);
export const insertListSchema = createInsertSchema(lists);
export const insertChoreSchema = createInsertSchema(chores);

// Type exports
export type User = typeof users.$inferSelect;
export type Family = typeof families.$inferSelect;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type FamilyInvite = typeof familyInvites.$inferSelect;
export type CalendarConnection = typeof calendarConnections.$inferSelect;
export type Event = typeof events.$inferSelect;
export type List = typeof lists.$inferSelect;
export type ListItem = typeof listItems.$inferSelect;
export type Chore = typeof chores.$inferSelect;
export type ChoreCompletion = typeof choreCompletions.$inferSelect;
export type Message = typeof messages.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertFamily = z.infer<typeof insertFamilySchema>;
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type InsertFamilyInvite = z.infer<typeof insertFamilyInviteSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertList = z.infer<typeof insertListSchema>;
export type InsertChore = z.infer<typeof insertChoreSchema>;
