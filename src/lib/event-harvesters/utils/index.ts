import { EventWithTags } from '../types';
import { format } from 'date-fns';

/**
 * Removes duplicate events based on title and date
 */
export function deduplicateEvents(events: EventWithTags[]): EventWithTags[] {
  const uniqueEvents = new Map<string, EventWithTags>();
  
  for (const event of events) {
    // Create a unique key based on title and date
    const dateStr = format(event.date, 'yyyy-MM-dd');
    const key = `${event.title}|${dateStr}`;
    
    // Only add if we don't already have this event
    if (!uniqueEvents.has(key)) {
      console.log(`Unique event: ${event.title} (${dateStr})`);
      uniqueEvents.set(key, event);
    } else {
      console.log(`Duplicate event found: ${event.title} (${dateStr})`);
      
      // If we have duplicate events, merge their tags
      const existingEvent = uniqueEvents.get(key)!;
      existingEvent.tags = [...new Set([...existingEvent.tags, ...event.tags])];
      
      // Use the longer description if available
      if (event.description && event.description.length > existingEvent.description.length) {
        existingEvent.description = event.description;
      }
      
      // Use location if existing one is TBD
      if (existingEvent.location === 'TBD' && event.location && event.location !== 'TBD') {
        existingEvent.location = event.location;
      }
    }
  }
  
  return Array.from(uniqueEvents.values());
}

/**
 * Filters out events that have already passed
 */
export function filterPastEvents(events: EventWithTags[]): EventWithTags[] {
  const now = new Date();
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= now;
  });
}

/**
 * Limits the number of events per source to avoid overwhelming the database
 */
export function limitEventsPerSource(
  events: EventWithTags[], 
  limit: number = 50
): EventWithTags[] {
  // Group events by source
  const eventsBySource = new Map<string, EventWithTags[]>();
  
  for (const event of events) {
    const source = event.agency || 'Unknown';
    if (!eventsBySource.has(source)) {
      eventsBySource.set(source, []);
    }
    eventsBySource.get(source)!.push(event);
  }
  
  // Limit events per source
  let limitedEvents: EventWithTags[] = [];
  
  for (const [source, sourceEvents] of eventsBySource.entries()) {
    // Sort by date (most recent first)
    const sortedEvents = [...sourceEvents].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Add the most recent events up to the limit
    limitedEvents = [...limitedEvents, ...sortedEvents.slice(0, limit)];
  }
  
  return limitedEvents;
}