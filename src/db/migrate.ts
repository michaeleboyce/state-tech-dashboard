import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Run migrations
async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('Running migrations...');
  
  await migrate(db, { migrationsFolder: 'src/db/migrations' });
  
  console.log('Migrations completed successfully');
  
  process.exit(0);
}

main().catch((error) => {
  console.error('Migration failed!', error);
  process.exit(1);
});