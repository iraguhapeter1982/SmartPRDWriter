import { eq, and, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  Family,
  InsertFamily,
  FamilyMember,
  InsertFamilyMember,
  Event,
  InsertEvent,
  List,
  InsertList,
  ListItem,
  InsertListItem,
  Chore,
  InsertChore,
  ChoreCompletion,
  InsertChoreCompletion,
  Message,
  InsertMessage,
  CalendarConnection,
  InsertCalendarConnection,
} from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User>;
  
  // Family operations
  createFamily(family: InsertFamily): Promise<Family>;
  getFamily(id: string): Promise<Family | undefined>;
  getFamilyByInviteCode(code: string): Promise<Family | undefined>;
  
  // Family member operations
  getFamilyMembers(familyId: string): Promise<FamilyMember[]>;
  createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
  updateFamilyMember(id: string, member: Partial<InsertFamilyMember>): Promise<FamilyMember>;
  deleteFamilyMember(id: string): Promise<void>;
  
  // Calendar operations
  createCalendarConnection(connection: InsertCalendarConnection): Promise<CalendarConnection>;
  getCalendarConnections(userId: string): Promise<CalendarConnection[]>;
  updateCalendarConnection(id: string, connection: Partial<InsertCalendarConnection>): Promise<CalendarConnection>;
  
  // Event operations
  getEventsByFamily(familyId: string, startDate?: Date, endDate?: Date): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  
  // List operations
  getListsByFamily(familyId: string): Promise<List[]>;
  createList(list: InsertList): Promise<List>;
  getListItems(listId: string): Promise<ListItem[]>;
  createListItem(item: InsertListItem): Promise<ListItem>;
  updateListItem(id: string, item: Partial<InsertListItem>): Promise<ListItem>;
  deleteListItem(id: string): Promise<void>;
  
  // Chore operations
  getChoresByFamily(familyId: string): Promise<Chore[]>;
  createChore(chore: InsertChore): Promise<Chore>;
  updateChore(id: string, chore: Partial<InsertChore>): Promise<Chore>;
  deleteChore(id: string): Promise<void>;
  completeChore(completion: InsertChoreCompletion): Promise<ChoreCompletion>;
  getChoreCompletions(choreId: string): Promise<ChoreCompletion[]>;
  
  // Message operations
  getMessagesByFamily(familyId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<Message>;
}

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(insertUser).returning();
    return result[0];
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User> {
    const result = await db
      .update(schema.users)
      .set({ 
        stripeCustomerId: customerId, 
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: 'active'
      })
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  // Family operations
  async createFamily(insertFamily: InsertFamily): Promise<Family> {
    const result = await db.insert(schema.families).values(insertFamily).returning();
    return result[0];
  }

  async getFamily(id: string): Promise<Family | undefined> {
    const result = await db.select().from(schema.families).where(eq(schema.families.id, id)).limit(1);
    return result[0];
  }

  async getFamilyByInviteCode(code: string): Promise<Family | undefined> {
    const result = await db.select().from(schema.families).where(eq(schema.families.inviteCode, code)).limit(1);
    return result[0];
  }

  // Family member operations
  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    return await db.select().from(schema.familyMembers).where(eq(schema.familyMembers.familyId, familyId));
  }

  async createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    const result = await db.insert(schema.familyMembers).values(member).returning();
    return result[0];
  }

  async updateFamilyMember(id: string, member: Partial<InsertFamilyMember>): Promise<FamilyMember> {
    const result = await db
      .update(schema.familyMembers)
      .set(member)
      .where(eq(schema.familyMembers.id, id))
      .returning();
    return result[0];
  }

  async deleteFamilyMember(id: string): Promise<void> {
    await db.delete(schema.familyMembers).where(eq(schema.familyMembers.id, id));
  }

  // Calendar operations
  async createCalendarConnection(connection: InsertCalendarConnection): Promise<CalendarConnection> {
    const result = await db.insert(schema.calendarConnections).values(connection).returning();
    return result[0];
  }

  async getCalendarConnections(userId: string): Promise<CalendarConnection[]> {
    return await db.select().from(schema.calendarConnections).where(eq(schema.calendarConnections.userId, userId));
  }

  async updateCalendarConnection(id: string, connection: Partial<InsertCalendarConnection>): Promise<CalendarConnection> {
    const result = await db
      .update(schema.calendarConnections)
      .set(connection)
      .where(eq(schema.calendarConnections.id, id))
      .returning();
    return result[0];
  }

  // Event operations
  async getEventsByFamily(familyId: string, startDate?: Date, endDate?: Date): Promise<Event[]> {
    let query = db.select().from(schema.events).where(eq(schema.events.familyId, familyId));
    
    return await query.orderBy(asc(schema.events.startTime));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(schema.events).values(event).returning();
    return result[0];
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const result = await db
      .update(schema.events)
      .set(event)
      .where(eq(schema.events.id, id))
      .returning();
    return result[0];
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(schema.events).where(eq(schema.events.id, id));
  }

  // List operations
  async getListsByFamily(familyId: string): Promise<List[]> {
    return await db.select().from(schema.lists).where(eq(schema.lists.familyId, familyId));
  }

  async createList(list: InsertList): Promise<List> {
    const result = await db.insert(schema.lists).values(list).returning();
    return result[0];
  }

  async getListItems(listId: string): Promise<ListItem[]> {
    return await db.select().from(schema.listItems).where(eq(schema.listItems.listId, listId));
  }

  async createListItem(item: InsertListItem): Promise<ListItem> {
    const result = await db.insert(schema.listItems).values(item).returning();
    return result[0];
  }

  async updateListItem(id: string, item: Partial<InsertListItem>): Promise<ListItem> {
    const result = await db
      .update(schema.listItems)
      .set(item)
      .where(eq(schema.listItems.id, id))
      .returning();
    return result[0];
  }

  async deleteListItem(id: string): Promise<void> {
    await db.delete(schema.listItems).where(eq(schema.listItems.id, id));
  }

  // Chore operations
  async getChoresByFamily(familyId: string): Promise<Chore[]> {
    return await db.select().from(schema.chores).where(eq(schema.chores.familyId, familyId));
  }

  async createChore(chore: InsertChore): Promise<Chore> {
    const result = await db.insert(schema.chores).values(chore).returning();
    return result[0];
  }

  async updateChore(id: string, chore: Partial<InsertChore>): Promise<Chore> {
    const result = await db
      .update(schema.chores)
      .set(chore)
      .where(eq(schema.chores.id, id))
      .returning();
    return result[0];
  }

  async deleteChore(id: string): Promise<void> {
    await db.delete(schema.chores).where(eq(schema.chores.id, id));
  }

  async completeChore(completion: InsertChoreCompletion): Promise<ChoreCompletion> {
    const result = await db.insert(schema.choreCompletions).values(completion).returning();
    return result[0];
  }

  async getChoreCompletions(choreId: string): Promise<ChoreCompletion[]> {
    return await db.select().from(schema.choreCompletions).where(eq(schema.choreCompletions.choreId, choreId)).orderBy(desc(schema.choreCompletions.completedAt));
  }

  // Message operations
  async getMessagesByFamily(familyId: string): Promise<Message[]> {
    return await db.select().from(schema.messages).where(eq(schema.messages.familyId, familyId)).orderBy(desc(schema.messages.receivedAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(schema.messages).values(message).returning();
    return result[0];
  }

  async markMessageAsRead(id: string): Promise<Message> {
    const result = await db
      .update(schema.messages)
      .set({ isRead: true })
      .where(eq(schema.messages.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
