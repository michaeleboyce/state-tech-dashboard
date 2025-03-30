import axios from 'axios';
import { parse } from 'node-html-parser';
import { SourceConfig, RawEvent, EventSource } from '../types';

export class WebScraperSource implements EventSource {
  name: string;
  url: string;
  jurisdiction: string;
  state: string;
  sourceType: string;
  agency: string;
  selector: string;
  options: Record<string, any>;
  
  constructor(config: SourceConfig) {
    this.name = config.name;
    this.url = config.url;
    this.jurisdiction = config.jurisdiction;
    this.state = config.state;
    this.sourceType = config.sourceType;
    this.agency = config.agency;
    this.selector = config.selector || '';
    this.options = config.options || {};
  }
  
  async fetch(): Promise<RawEvent[]> {
    try {
      const response = await axios.get(this.url);
      const html = response.data;
      const root = parse(html);
      const elements = root.querySelectorAll(this.selector);
      
      return elements.map((element: any, index: number) => {
        const title = this.extractTitle(element);
        const description = this.extractDescription(element);
        const date = this.extractDate(element);
        const link = this.extractLink(element);
        const location = this.extractLocation(element);
        
        return {
          sourceId: `${this.name}-${index}-${date.toISOString()}`,
          title,
          description,
          date,
          link: this.resolveUrl(link),
          location,
          sourceData: element.toString(),
          source: this.name,
          agency: this.agency
        };
      });
    } catch (error) {
      console.error(`Error scraping web page from ${this.url}:`, error);
      return [];
    }
  }

  // Base extraction methods - specific scrapers can override these
  protected extractTitle(element: any): string {
    // Default implementation attempts to find common title elements
    const titleElement = element.querySelector('h1, h2, h3, h4, .title, [itemprop="name"]');
    return titleElement ? titleElement.text.trim() : 'Unknown Event';
  }

  protected extractDescription(element: any): string {
    // Default implementation looks for common description elements
    const descElement = element.querySelector('p, .description, [itemprop="description"]');
    return descElement ? descElement.text.trim() : '';
  }

  protected extractDate(element: any): Date {
    // Default implementation tries to find date in common formats
    const dateElement = element.querySelector('[datetime], .date, [itemprop="startDate"], .event-date, .calendar-date, time');
    
    if (dateElement) {
      // Try to get date from datetime attribute
      const dateAttr = dateElement.getAttribute('datetime');
      if (dateAttr) {
        const parsedDate = new Date(dateAttr);
        if (!isNaN(parsedDate.getTime())) return parsedDate;
      }
      
      // Otherwise try to parse the text content
      const dateText = dateElement.text.trim();
      if (dateText) {
        const parsedDate = new Date(dateText);
        if (!isNaN(parsedDate.getTime())) return parsedDate;
      }
    }
    
    // Try to find date pattern in the entire element text
    const fullText = element.text.trim();
    
    // Common date patterns: "January 15, 2023", "15 Jan 2023", "01/15/2023", "2023-01-15"
    const datePatterns = [
      /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}/i,
      /\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}/i,
      /\d{1,2}\/\d{1,2}\/\d{4}/,
      /\d{4}-\d{1,2}-\d{1,2}/
    ];
    
    for (const pattern of datePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        const dateStr = match[0];
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    
    return new Date(); // Fallback to current date
  }

  protected extractLink(element: any): string {
    // Try to get a link from the element
    const linkElement = element.querySelector('a, [itemprop="url"]');
    return linkElement ? linkElement.getAttribute('href') : '';
  }

  protected extractLocation(element: any): string | undefined {
    // Try to get location information
    const locationElement = element.querySelector('.location, [itemprop="location"]');
    return locationElement ? locationElement.text.trim() : undefined;
  }

  private resolveUrl(relativeUrl: string): string {
    if (!relativeUrl) return this.url;
    
    // Check if it's already absolute
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    
    // Resolve relative URL
    const baseUrl = new URL(this.url);
    if (relativeUrl.startsWith('/')) {
      return `${baseUrl.origin}${relativeUrl}`;
    } else {
      return `${baseUrl.origin}/${relativeUrl}`;
    }
  }
}