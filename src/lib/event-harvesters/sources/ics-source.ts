import axios from 'axios';
import ical from 'ical';
import { SourceConfig, RawEvent, EventSource } from '../types';

export class ICSSource implements EventSource {
  name: string;
  url: string;
  jurisdiction: string;
  state: string;
  sourceType: string;
  agency: string;
  
  constructor(config: SourceConfig) {
    this.name = config.name;
    this.url = config.url;
    this.jurisdiction = config.jurisdiction;
    this.state = config.state;
    this.sourceType = config.sourceType;
    this.agency = config.agency;
  }
  
  async fetch(): Promise<RawEvent[]> {
    try {
      const response = await axios.get(this.url);
      const data = response.data;
      const events = ical.parseICS(data);
      
      return Object.values(events)
        .filter(event => event.type === 'VEVENT')
        .map((event: any) => {
          // Extract categories if available
          let categories: string | string[] = [];
          if (event.categories) {
            if (typeof event.categories === 'string') {
              categories = event.categories;
            } else if (Array.isArray(event.categories)) {
              categories = event.categories;
            }
          }
          
          return {
            sourceId: event.uid || `${this.name}-${event.start?.toISOString()}`,
            title: event.summary || 'Untitled Event',
            description: event.description || '',
            date: event.start || new Date(),
            link: this.extractUrl(event) || this.url,
            location: event.location,
            category: categories,
            sourceData: {
              ...event,
              organizer: event.organizer,
              attendees: event.attendees,
              status: event.status,
              recurrenceRule: event.rrule,
              sequence: event.sequence
            },
            source: this.name,
            agency: this.agency
          };
        });
    } catch (error) {
      console.error(`Error fetching ICS calendar from ${this.url}:`, error);
      return [];
    }
  }

  private extractUrl(event: any): string | undefined {
    // Try to extract URL from description or other fields
    if (event.url) return event.url;
    
    // Some ICS feeds include URLs in the description
    if (event.description) {
      const urlMatch = event.description.match(/https?:\/\/[^\s"'<>]+/);
      if (urlMatch) return urlMatch[0];
    }
    
    return undefined;
  }
}