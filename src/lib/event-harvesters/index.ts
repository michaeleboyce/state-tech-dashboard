import { EventWithTags } from './types';
import { getAllSources } from './sources';
import { formatEvent } from './normalizers';
import { deduplicateEvents, filterPastEvents, limitEventsPerSource } from './utils';
import { saveEvents } from './db-service';

export interface HarvestOptions {
  dryRun?: boolean;
  sources?: string[];
  verbose?: boolean;
  saveResults?: boolean;
  filterPast?: boolean;
  maxEventsPerSource?: number;
}

/**
 * Main function to harvest events from all sources
 */
export async function harvestEvents(options: HarvestOptions = {}): Promise<EventWithTags[]> {
  // Default options
  const {
    dryRun = false,
    sources = [],
    verbose = false,
    saveResults = true,
    filterPast = true,
    maxEventsPerSource = 100
  } = options;
  
  // Get all source adapters or filter by names if provided
  const eventSources = await getAllSources(sources.length > 0 ? sources : undefined);
  const allEvents: EventWithTags[] = [];
  
  if (verbose) {
    console.log(`Starting harvest from ${eventSources.length} sources`);
  }
  
  for (const source of eventSources) {
    try {
      if (verbose) {
        console.log(`Harvesting from ${source.name} (${source.sourceType})`);
      }
      
      // Fetch raw events from source
      const rawEvents = await source.fetch();
      
      if (verbose) {
        console.log(`  Found ${rawEvents.length} raw events`);
      }
      
      // Normalize events to our schema
      const normalizedEvents = [];
      for (const event of rawEvents) {
        try {
          normalizedEvents.push(formatEvent(event, source.sourceType, source.jurisdiction));
        } catch (normalizeError) {
          console.error(`Error normalizing event from ${source.name}:`, normalizeError);
          // Continue with other events
        }
      }
      
      allEvents.push(...normalizedEvents);
      
      if (verbose) {
        console.log(`  Normalized ${normalizedEvents.length} events`);
      }
    } catch (error) {
      console.error(`Error harvesting from ${source.name}:`, error);
      // Continue with other sources
    }
  }
  
  // Process the events
  let processedEvents = allEvents;
  
  // Remove duplicate events
  processedEvents = deduplicateEvents(processedEvents);
  
  if (verbose) {
    console.log(`After deduplication: ${processedEvents.length} events`);
  }
  
  // Filter out past events if requested
  if (filterPast) {
    processedEvents = filterPastEvents(processedEvents);
    
    if (verbose) {
      console.log(`After filtering past events: ${processedEvents.length} events`);
    }
  }
  
  // Limit events per source
  processedEvents = limitEventsPerSource(processedEvents, maxEventsPerSource);
  
  if (verbose) {
    console.log(`After limiting per source: ${processedEvents.length} events`);
  }
  
  // Save to database if requested and not a dry run
  if (saveResults && !dryRun) {
    const savedCount = await saveEvents(processedEvents);
    
    if (verbose) {
      console.log(`Saved ${savedCount} new events to the database`);
    }
  } else if (verbose) {
    console.log(`Dry run - not saving ${processedEvents.length} events to database`);
  }
  
  return processedEvents;
}

// Export all submodules
export * from './sources';
export * from './normalizers';
export * from './utils';
export * from './db-service';
export * from './types';