import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { events, eventTags, tags } from '../src/db/schema';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Initialize the database client
const sql = neon(connectionString);
const db = drizzle(sql);

async function cleanEvents() {
  console.log('Starting database cleanup...');
  
  try {
    // Delete all event-tag relationships
    console.log('Deleting event-tag relationships...');
    await db.delete(eventTags);
    
    // Delete all events
    console.log('Deleting events...');
    await db.delete(events);
    
    // Delete all tags
    console.log('Deleting tags...');
    await db.delete(tags);
    
    console.log('Database cleanup completed successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
cleanEvents();