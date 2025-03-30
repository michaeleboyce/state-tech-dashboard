import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

async function testConnection() {
  console.log('Testing database connection...');
  console.log(`Connection string: ${connectionString.slice(0, 20)}...`);
  
  try {
    // Initialize the database client
    const sql = neon(connectionString);
    const db = drizzle(sql);
    
    // Test query
    const result = await sql`SELECT NOW()`;
    
    console.log('Connection successful!');
    console.log(`Current database time: ${result[0].now}`);
    
    // Check if DATABASE_URL is for Neon
    if (!connectionString.includes('neon.tech')) {
      console.warn('WARNING: Your DATABASE_URL does not appear to be a Neon database URL');
    }
    
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
testConnection();