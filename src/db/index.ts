import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Initialize the database client
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

// Type definitions for our models
export type Event = typeof schema.events.$inferSelect;
export type NewEvent = typeof schema.events.$inferInsert;
export type Tag = typeof schema.tags.$inferSelect;
export type NewTag = typeof schema.tags.$inferInsert;