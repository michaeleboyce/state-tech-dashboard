import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { events, tags, eventTags } from '../src/db/schema';
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

async function checkEvents() {
  console.log('Checking database events...');
  
  try {
    // Count events
    const eventCount = await db.select({ count: 
      { value: events.id, fn: 'count' } 
    }).from(events);
    
    console.log(`Total events in database: ${eventCount[0].count.value}`);
    
    // Count tags
    const tagCount = await db.select({ count: 
      { value: tags.id, fn: 'count' } 
    }).from(tags);
    
    console.log(`Total tags in database: ${tagCount[0].count.value}`);
    
    // List events (limit to 10)
    const eventsList = await db.select().from(events).limit(10);
    
    console.log('\nRecent events:');
    for (const event of eventsList) {
      console.log(`- ${event.title} (${event.date}) - ${event.agency}`);
    }
    
    // List tags (limit to 20)
    const tagsList = await db.select().from(tags).limit(20);
    
    console.log('\nTags in database:');
    console.log(tagsList.map(tag => tag.name).join(', '));
    
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
checkEvents();