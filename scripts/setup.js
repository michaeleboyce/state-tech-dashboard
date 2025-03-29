#!/usr/bin/env node

/**
 * This script helps set up the database and runs migrations and seeding
 * Useful for deployment to Vercel or other platforms
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return false;
  }
}

async function setup() {
  console.log('Setting up the database...');
  
  // Run migrations
  console.log('Running migrations...');
  const migrationSuccess = await runCommand('npm run db:migrate');
  
  if (!migrationSuccess) {
    console.error('Migration failed. Stopping setup.');
    process.exit(1);
  }
  
  // Seed the database
  console.log('Seeding the database...');
  const seedSuccess = await runCommand('npm run db:seed');
  
  if (!seedSuccess) {
    console.error('Database seeding failed. Stopping setup.');
    process.exit(1);
  }
  
  console.log('Setup completed successfully!');
}

setup().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});