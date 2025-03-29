import { pgTable, serial, text, varchar, date, boolean } from "drizzle-orm/pg-core";

// Events table schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  jurisdiction: varchar("jurisdiction", { length: 50 }).notNull(),
  agency: varchar("agency", { length: 255 }).notNull(),
  url: varchar("url", { length: 255 }),
  virtual: boolean("virtual").default(false),
});

// Tags table schema (many-to-many relationship with events)
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

// Junction table for event_tags (many-to-many relationship)
export const eventTags = pgTable("event_tags", {
  eventId: serial("event_id").references(() => events.id),
  tagId: serial("tag_id").references(() => tags.id),
});