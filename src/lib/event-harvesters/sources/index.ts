import { RSSSource } from './rss-source';
import { ICSSource } from './ics-source';
import { WebScraperSource } from './web-scraper-source';
import { EventSource } from '../types';

// Registry of all event sources
const sources: EventSource[] = [
  // Pennsylvania sources
  new RSSSource({
    name: 'pa-house-committee',
    url: 'https://www.legis.state.pa.us/WU01/LI/RSS/CMSH.xml',
    jurisdiction: 'State',
    state: 'PA',
    sourceType: 'legislature-committee',
    agency: 'Pennsylvania House of Representatives'
  }),
  
  new RSSSource({
    name: 'pa-house-calendar',
    url: 'https://www.legis.state.pa.us/WU01/LI/RSS/CAL/HouseCalendarSS0reg.xml',
    jurisdiction: 'State',
    state: 'PA',
    sourceType: 'legislature-calendar',
    agency: 'Pennsylvania House of Representatives'
  }),
  
  // Sample sources for other states - implement real ones as needed
  new ICSSource({
    name: 'ca-state-board',
    url: 'https://www.calendarwiz.com/CalendarWiz_iCal.php?crd=technology&cid=technology',
    jurisdiction: 'State',
    state: 'CA',
    sourceType: 'executive',
    agency: 'California Technology Board'
  }),
  
  new WebScraperSource({
    name: 'ny-tech-meetings',
    url: 'https://meetny.webex.com/webappng/sites/meetny/dashboard?siteurl=meetny',
    jurisdiction: 'State',
    state: 'NY',
    sourceType: 'executive',
    agency: 'New York Technology Services',
    selector: '.meeting-card' // CSS selector for event items
  }),
  
  new RSSSource({
    name: 'wa-ocio-blog',
    url: 'https://ocio.wa.gov/rss.xml',
    jurisdiction: 'State',
    state: 'WA',
    sourceType: 'executive',
    agency: 'Washington Office of the Chief Information Officer'
  })
];

export async function getAllSources(sourceNames?: string[]): Promise<EventSource[]> {
  if (!sourceNames || sourceNames.length === 0) {
    return sources;
  }
  
  return sources.filter(source => 
    sourceNames.includes(source.name)
  );
}

export function addSource(source: EventSource): void {
  // Ensure source with same name doesn't already exist
  const existingIndex = sources.findIndex(s => s.name === source.name);
  
  if (existingIndex >= 0) {
    sources[existingIndex] = source; // Replace existing source
  } else {
    sources.push(source); // Add new source
  }
}