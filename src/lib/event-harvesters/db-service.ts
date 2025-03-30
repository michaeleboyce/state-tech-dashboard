import { EventWithTags } from './types';
import { db } from '@/db';
import { events as eventsTable, tags as tagsTable, eventTags as eventTagsTable } from '@/db/schema';
import { eq } from 'drizzle-orm/expressions';

// No helper function needed

/**
 * Saves events to the database, handling duplicates and relationships
 */
export async function saveEvents(events: EventWithTags[]): Promise<number> {
  if (!events.length) return 0;
  
  let savedCount = 0;
  
  // Get existing tags to avoid duplicates
  const existingTagsResult = await db.select().from(tagsTable);
  const existingTags = new Map<string, number>();
  
  for (const tag of existingTagsResult) {
    existingTags.set(tag.name, tag.id);
  }
  
  console.log(`Attempting to save ${events.length} events to database...`);

  // Process events one by one to handle tag relationships
  for (const event of events) {
    try {
      // Check if event already exists by URL and date
      const existingEvents = await db
        .select()
        .from(eventsTable)
        .where(
          eq(eventsTable.url, event.url || '')
        );
      
      const sameEvent = existingEvents.find(e => 
        new Date(e.date).toDateString() === new Date(event.date).toDateString() &&
        e.title === event.title
      );
      
      // If event already exists, skip it
      if (sameEvent) {
        console.log(`Event already exists: ${event.title} (${new Date(event.date).toDateString()})`);
        continue;
      }
      
      console.log(`Saving new event: ${event.title} (${new Date(event.date).toDateString()})`);
      
      
      // Insert the event
      const [insertedEvent] = await db
        .insert(eventsTable)
        .values({
          title: event.title,
          description: event.description,
          date: typeof event.date === 'string' ? event.date : new Date(event.date).toISOString().split('T')[0],
          location: event.location,
          jurisdiction: event.jurisdiction,
          agency: event.agency,
          url: event.url || null,
          virtual: event.virtual
        })
        .returning({ id: eventsTable.id });
      
      // Process tags
      for (const tagName of event.tags) {
        let tagId: number;
        
        // Use existing tag if available
        if (existingTags.has(tagName)) {
          tagId = existingTags.get(tagName)!;
        } else {
          // Try to insert new tag
          try {
            const [newTag] = await db
              .insert(tagsTable)
              .values({ name: tagName })
              .returning({ id: tagsTable.id });
            
            tagId = newTag.id;
            existingTags.set(tagName, tagId);
          } catch (error) {
            // Tag might have been inserted by another process
            // Try to get it again
            const tagResult = await db
              .select()
              .from(tagsTable)
              .where(eq(tagsTable.name, tagName));
            
            if (tagResult.length > 0) {
              tagId = tagResult[0].id;
              existingTags.set(tagName, tagId);
            } else {
              // Skip this tag if we can't get or create it
              console.error(`Could not create or find tag: ${tagName}`);
              continue;
            }
          }
        }
        
        // Create relationship between event and tag
        await db
          .insert(eventTagsTable)
          .values({
            eventId: insertedEvent.id,
            tagId: tagId
          });
      }
      
      savedCount++;
    } catch (error) {
      console.error(`Error saving event "${event.title}":`, error);
    }
  }
  
  return savedCount;
}