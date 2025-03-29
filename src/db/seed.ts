import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { events, tags, eventTags } from './schema';
import { events as seedEvents } from '../lib/events-data';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Initialize the database client directly in this file to avoid circular imports
const sql = neon(connectionString);
const db = drizzle(sql);

async function seed() {
  console.log('Seeding database...');
  
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await db.delete(eventTags);
    await db.delete(events);
    await db.delete(tags);
    
    console.log('Adding tags...');
    // Insert all unique tags
    const uniqueTags = Array.from(
      new Set(seedEvents.flatMap(event => event.tags))
    ).sort();
    
    const insertedTags: Record<string, number> = {};
    
    for (const tagName of uniqueTags) {
      const result = await db.insert(tags).values({
        name: tagName
      }).returning({ id: tags.id });
      
      if (result && result.length > 0) {
        insertedTags[tagName] = result[0].id;
      }
    }
    
    console.log(`Inserted ${Object.keys(insertedTags).length} tags`);
    
    // Insert events and their tags
    console.log('Adding events...');
    for (const seedEvent of seedEvents) {
      // Insert the event
      const result = await db.insert(events).values({
        title: seedEvent.title,
        description: seedEvent.description,
        date: seedEvent.date,
        location: seedEvent.location,
        jurisdiction: seedEvent.jurisdiction,
        agency: seedEvent.agency,
        url: seedEvent.url || null,
        virtual: seedEvent.virtual || false
      }).returning({ id: events.id });
      
      if (result && result.length > 0) {
        const eventId = result[0].id;
        
        // Insert event-tag relationships
        for (const tagName of seedEvent.tags) {
          if (insertedTags[tagName]) {
            await db.insert(eventTags).values({
              eventId: eventId,
              tagId: insertedTags[tagName]
            });
          }
        }
      }
    }
    
    console.log(`Inserted ${seedEvents.length} events with their tags`);
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
  
  process.exit(0);
}

seed();