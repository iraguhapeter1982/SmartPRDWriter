import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Configure WebSocket for Neon serverless in Node.js environment
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
