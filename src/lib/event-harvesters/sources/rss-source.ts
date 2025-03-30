import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { SourceConfig, RawEvent, EventSource } from '../types';

export class RSSSource implements EventSource {
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
      const result = await parseStringPromise(response.data, { 
        explicitArray: false,
        mergeAttrs: true
      });
      
      if (!result.rss || !result.rss.channel || !result.rss.channel.item) {
        return [];
      }
      
      const items = Array.isArray(result.rss.channel.item) 
        ? result.rss.channel.item 
        : [result.rss.channel.item];
      
      return items.map((item: any) => ({
        sourceId: item.guid?._text || item.guid || item.link,
        title: item.title,
        description: item.description,
        date: new Date(item.pubDate),
        link: item.link,
        location: this.extractLocation(item),
        category: item.category,
        sourceData: item,
        source: this.name,
        agency: this.agency
      }));
    } catch (error) {
      console.error(`Error fetching RSS feed from ${this.url}:`, error);
      return [];
    }
  }

  private extractLocation(item: any): string | undefined {
    // Base implementation - specific sources can override this
    return undefined;
  }
}