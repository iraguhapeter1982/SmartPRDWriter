import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL?.replace(/\?.*$/, '') + '?sslmode=require';

const pool = new Pool({ connectionString });

async function createCalendarEventsTable() {
  const client = await pool.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        google_event_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        location TEXT,
        assigned_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
        member_color TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('✅ Calendar events table created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createCalendarEventsTable();
