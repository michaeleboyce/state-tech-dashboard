import { harvestEvents } from '../src/lib/event-harvesters';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('Starting event harvest process...');
  
  // Get command line arguments
  const dryRun = process.argv.includes('--dry-run');
  const verbose = process.argv.includes('--verbose');
  const skipSave = process.argv.includes('--no-save');
  
  // Extract specific sources if provided
  const sourceArg = process.argv.find(arg => arg.startsWith('--sources='));
  const sources = sourceArg
    ? sourceArg.replace('--sources=', '').split(',')
    : [];
  
  // Extract max events per source if provided
  const maxEventsArg = process.argv.find(arg => arg.startsWith('--max-events='));
  const maxEventsPerSource = maxEventsArg
    ? parseInt(maxEventsArg.replace('--max-events=', ''), 10)
    : 100;
  
  // Set options
  const options = {
    dryRun,
    sources,
    verbose,
    saveResults: !skipSave,
    filterPast: true,
    maxEventsPerSource
  };
  
  // Run the harvester
  try {
    const events = await harvestEvents(options);
    
    console.log(`Harvested ${events.length} events`);
    
    // Save last harvest info
    await fs.mkdir(path.join(process.cwd(), 'src/data'), { recursive: true });
    
    await fs.writeFile(
      path.join(process.cwd(), 'src/data/last-harvest.json'),
      JSON.stringify({
        lastRun: new Date().toISOString(),
        eventCount: events.length,
        sources: sources.length ? sources : 'all'
      }, null, 2)
    );
    
    console.log('Event harvest completed successfully');
  } catch (error) {
    console.error('Error during event harvest:', error);
    process.exit(1);
  }
}

// Run the script
main();