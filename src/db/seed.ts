import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { events, tags, eventTags } from './schema';
import { events as seedEvents } from '../lib/events-data';
import { harvestEvents } from '../lib/event-harvesters';
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
    
    // Check for verbose flag
    const verbose = process.argv.includes('--verbose');
    
    // Option 1: Seed using static data
    if (process.argv.includes('--static-only')) {
      await seedWithStaticData(verbose);
    } 
    // Option 2: Seed using harvester
    else if (process.argv.includes('--harvest-only')) {
      await seedWithHarvester(verbose);
    }
    // Option 3: Seed with both (default)
    else {
      await seedWithStaticData(verbose);
      await seedWithHarvester(verbose);
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
  
  process.exit(0);
}

async function seedWithStaticData(verbose = false) {
  console.log('Adding tags from static data...');
  
  // First get existing tags from the database
  const existingTagsResult = await db.select().from(tags);
  const existingTagsMap = new Map<string, number>();
  
  for (const tag of existingTagsResult) {
    existingTagsMap.set(tag.name, tag.id);
  }
  
  // Get all unique tags from seed events
  const uniqueTags = Array.from(
    new Set(seedEvents.flatMap(event => event.tags))
  ).sort();
  
  const insertedTags: Record<string, number> = {};
  
  // Add existing tags to our map
  for (const tag of existingTagsResult) {
    insertedTags[tag.name] = tag.id;
  }
  
  // Only insert tags that don't already exist
  for (const tagName of uniqueTags) {
    // Skip if tag already exists
    if (existingTagsMap.has(tagName)) {
      if (verbose) {
        console.log(`Tag already exists: ${tagName}`);
      }
      continue;
    }
    
    try {
      const result = await db.insert(tags).values({
        name: tagName
      }).returning({ id: tags.id });
      
      if (result && result.length > 0) {
        insertedTags[tagName] = result[0].id;
      }
    } catch (error) {
      // Log error but continue with other tags
      console.error(`Error inserting tag ${tagName}:`, error);
    }
  }
  
  console.log(`Inserted ${Object.keys(insertedTags).length} tags from static data`);
  
  // Insert events and their tags
  console.log('Adding events from static data...');
  for (const seedEvent of seedEvents) {
    // Insert the event - convert Date to ISO string for the date field
    const result = await db.insert(events).values({
      title: seedEvent.title,
      description: seedEvent.description,
      date: typeof seedEvent.date === 'string' ? seedEvent.date : new Date(seedEvent.date).toISOString().split('T')[0],
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
  
  console.log(`Inserted ${seedEvents.length} events from static data`);
}

async function seedWithHarvester(verbose = false) {
  console.log('Harvesting events from sources...');
  
  // Get sources to use for seeding (can be specified via command line)
  const sourceArg = process.argv.find(arg => arg.startsWith('--sources='));
  const sources = sourceArg
    ? sourceArg.replace('--sources=', '').split(',')
    : [];
  
  // Run the harvester with options for seeding
  const harvestedEvents = await harvestEvents({
    sources,
    verbose: true,
    saveResults: false, // We'll handle saving in this function
    filterPast: false,  // Include all events for seeding
    maxEventsPerSource: 200 // More events for initial seeding
  });
  
  console.log(`Harvested ${harvestedEvents.length} events from sources`);
  
  // We need to save the events manually since we set saveResults to false
  // First get existing tags to avoid duplicates
  console.log('Adding tags from harvested events...');
  
  // Get existing tags from the database
  const existingTagsResult = await db.select().from(tags);
  const existingTagsMap = new Map<string, number>();
  
  for (const tag of existingTagsResult) {
    existingTagsMap.set(tag.name, tag.id);
  }
  
  // Get all unique tags from harvested events
  const uniqueTags = Array.from(
    new Set(harvestedEvents.flatMap(event => event.tags))
  ).sort();
  
  const insertedTags: Record<string, number> = {};
  
  // Add existing tags to our map
  for (const tag of existingTagsResult) {
    insertedTags[tag.name] = tag.id;
  }
  
  // Only insert tags that don't already exist
  for (const tagName of uniqueTags) {
    // Skip if tag already exists
    if (existingTagsMap.has(tagName)) {
      if (verbose) {
        console.log(`Tag already exists: ${tagName}`);
      }
      continue;
    }
    
    try {
      const result = await db.insert(tags).values({
        name: tagName
      }).returning({ id: tags.id });
      
      if (result && result.length > 0) {
        insertedTags[tagName] = result[0].id;
      }
    } catch (error) {
      // Log error but continue with other tags
      console.error(`Error inserting tag ${tagName}:`, error);
    }
  }
  
  console.log(`Inserted ${Object.keys(insertedTags).length} tags from harvested events`);
  
  // Insert events and their tags
  console.log('Adding harvested events...');
  for (const harvestedEvent of harvestedEvents) {
    // Insert the event - convert Date to ISO string for the date field
    const result = await db.insert(events).values({
      title: harvestedEvent.title,
      description: harvestedEvent.description,
      date: typeof harvestedEvent.date === 'string' ? harvestedEvent.date : new Date(harvestedEvent.date).toISOString().split('T')[0],
      location: harvestedEvent.location,
      jurisdiction: harvestedEvent.jurisdiction,
      agency: harvestedEvent.agency,
      url: harvestedEvent.url || null,
      virtual: harvestedEvent.virtual
    }).returning({ id: events.id });
    
    if (result && result.length > 0) {
      const eventId = result[0].id;
      
      // Insert event-tag relationships
      for (const tagName of harvestedEvent.tags) {
        if (insertedTags[tagName]) {
          await db.insert(eventTags).values({
            eventId: eventId,
            tagId: insertedTags[tagName]
          });
        }
      }
    }
  }
  
  console.log(`Inserted ${harvestedEvents.length} harvested events`);
}

seed();