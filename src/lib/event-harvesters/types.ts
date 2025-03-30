import { EventWithTags } from '@/lib/db-utils';

export interface SourceConfig {
  name: string;
  url: string;
  jurisdiction: string;
  state: string;
  sourceType: string;
  agency: string;
  selector?: string; // For web scrapers
  options?: Record<string, any>; // Additional source-specific options
}

export interface RawEvent {
  sourceId: string;
  title: string;
  description: string;
  date: Date;
  link: string;
  location?: string;
  category?: string | string[];
  sourceData?: any;
  source: string;
  agency?: string;
}

export interface EventSource {
  name: string;
  url: string;
  jurisdiction: string;
  state: string;
  sourceType: string;
  agency: string;
  fetch(): Promise<RawEvent[]>;
}

export type { EventWithTags };