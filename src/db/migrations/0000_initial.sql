CREATE TABLE IF NOT EXISTS "events" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "location" VARCHAR(255) NOT NULL,
  "jurisdiction" VARCHAR(50) NOT NULL,
  "agency" VARCHAR(255) NOT NULL,
  "url" VARCHAR(255),
  "virtual" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "tags" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "event_tags" (
  "event_id" INTEGER REFERENCES "events"("id") ON DELETE CASCADE,
  "tag_id" INTEGER REFERENCES "tags"("id") ON DELETE CASCADE,
  PRIMARY KEY ("event_id", "tag_id")
);