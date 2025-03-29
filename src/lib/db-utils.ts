import { db } from '@/db';
import { events, tags, eventTags } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm/expressions';

// Interface for event with tags
export interface EventWithTags {
  id: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  jurisdiction: string;
  agency: string;
  url: string | null;
  virtual: boolean;
  tags: string[];
}

// Get all events with their tags
export async function getAllEvents(): Promise<EventWithTags[]> {
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      date: events.date,
      location: events.location,
      jurisdiction: events.jurisdiction,
      agency: events.agency,
      url: events.url,
      virtual: events.virtual,
      tagName: tags.name,
    })
    .from(events)
    .leftJoin(eventTags, eq(events.id, eventTags.eventId))
    .leftJoin(tags, eq(eventTags.tagId, tags.id));

  // Group by event and collect tags
  const eventMap = new Map<number, EventWithTags>();

  for (const row of rows) {
    if (!eventMap.has(row.id)) {
      eventMap.set(row.id, {
        id: row.id,
        title: row.title,
        description: row.description,
        date: row.date,
        location: row.location,
        jurisdiction: row.jurisdiction,
        agency: row.agency,
        url: row.url,
        virtual: row.virtual,
        tags: row.tagName ? [row.tagName] : [],
      });
    } else if (row.tagName) {
      eventMap.get(row.id)!.tags.push(row.tagName);
    }
  }

  return Array.from(eventMap.values());
}

// Get event by ID with tags
export async function getEventById(id: number): Promise<EventWithTags | null> {
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      date: events.date,
      location: events.location,
      jurisdiction: events.jurisdiction,
      agency: events.agency,
      url: events.url,
      virtual: events.virtual,
      tagName: tags.name,
    })
    .from(events)
    .leftJoin(eventTags, eq(events.id, eventTags.eventId))
    .leftJoin(tags, eq(eventTags.tagId, tags.id))
    .where(eq(events.id, id));

  if (rows.length === 0) {
    return null;
  }

  // Combine all tags for this event
  const event: EventWithTags = {
    id: rows[0].id,
    title: rows[0].title,
    description: rows[0].description,
    date: rows[0].date,
    location: rows[0].location,
    jurisdiction: rows[0].jurisdiction,
    agency: rows[0].agency,
    url: rows[0].url,
    virtual: rows[0].virtual,
    tags: rows.filter(row => row.tagName).map(row => row.tagName),
  };

  return event;
}

// Get all tags
export async function getAllTags(): Promise<string[]> {
  const result = await db
    .select({
      name: tags.name,
    })
    .from(tags)
    .orderBy(tags.name);

  return result.map(tag => tag.name);
}