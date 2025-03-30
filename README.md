# State & Local Government Tech Events Dashboard

A web application that displays upcoming technology-related events in state and local governments across the United States.

## Features

- Browse upcoming events in state and local government technology
- Filter events by jurisdiction (State or Local government)
- Search events by title, description, agency, or tags
- View detailed information about each event including date, location, and agency
- Links to event websites for more information
- Automated event harvesting from government websites, RSS feeds, and calendars

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [date-fns](https://date-fns.org/) - Date formatting
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [Neon](https://neon.tech/) - Serverless PostgreSQL database
- [Axios](https://axios-http.com/) - HTTP client
- [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) - XML parsing
- [node-html-parser](https://github.com/taoqf/node-html-parser) - HTML parsing
- [ical](https://github.com/peterbraden/ical.js) - iCalendar parsing

## Setup and Deployment

This application can be easily deployed to Vercel.

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your database credentials:
   ```
   DATABASE_URL=postgres://user:password@host:port/database
   ```
4. Run database migrations: `npm run db:migrate`
5. Seed the database: `npm run db:seed`
6. Start the development server: `npm run dev`
7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Deployment

The easiest way to deploy this application is using Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in [Vercel](https://vercel.com/new)
3. Add the `DATABASE_URL` environment variable in Vercel project settings
4. Vercel will automatically detect Next.js and configure the build settings
5. Deploy

## Event Harvesting System

The application includes an automated event harvesting system that collects events from various government sources, normalizes the data, and stores it in the database.

### Supported Source Types

- **RSS Feeds**: Parses RSS feeds from legislative committees, calendars, etc.
- **ICS Calendars**: Extracts events from iCalendar files published by government agencies
- **Web Scraping**: Harvests events from government websites using HTML parsing

### Running the Harvester Manually

To run the event harvester manually:

```bash
# Harvest from all sources
npx tsx scripts/harvest-events.ts

# Run in dry-run mode (don't save to database)
npx tsx scripts/harvest-events.ts --dry-run

# Run with verbose logging
npx tsx scripts/harvest-events.ts --verbose

# Harvest from specific sources
npx tsx scripts/harvest-events.ts --sources=pa-house-committee,pa-house-calendar

# Limit maximum events per source
npx tsx scripts/harvest-events.ts --max-events=50
```

### Scheduled Harvesting

The application uses GitHub Actions to automatically harvest events on a daily schedule. The workflow configuration is in `.github/workflows/harvest-events.yml`.

### Adding New Event Sources

To add new event sources:

1. Identify the source type (RSS, ICS, web page)
2. Add a new source configuration in `src/lib/event-harvesters/sources/index.ts`
3. If necessary, create a specialized normalizer in `src/lib/event-harvesters/normalizers/`

### Tech Tag Identification

The system includes automatic tech tag identification that analyzes event content for technology-related keywords and adds appropriate tags. This helps filter and categorize events related to:

- Information Technology
- Cybersecurity
- Digital Services
- Cloud Computing
- Data Management
- Network Infrastructure
- Software Development
- AI & Machine Learning
- IT Modernization
- And more

These tags make it easy to find relevant events in the dashboard.

## License

MIT