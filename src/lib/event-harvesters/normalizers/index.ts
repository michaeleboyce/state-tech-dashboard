import { normalizeCommitteeEvent } from './legislature-committee';
import { normalizeCalendarEvent } from './legislature-calendar';
import { normalizeExecutiveEvent } from './executive';
import { normalizeCityMeeting } from './city-meetings';
import { RawEvent, EventWithTags } from '../types';
import { createBaseEvent } from './base';

export function formatEvent(
  rawEvent: RawEvent, 
  sourceType: string,
  jurisdiction: string
): EventWithTags {
  // Create base event with common properties
  const baseEvent = createBaseEvent(rawEvent, jurisdiction);
  
  // Apply source-specific formatting based on the source type
  switch (sourceType) {
    case 'legislature-committee':
      return normalizeCommitteeEvent(rawEvent, baseEvent);
    case 'legislature-calendar':
      return normalizeCalendarEvent(rawEvent, baseEvent);
    case 'executive':
      return normalizeExecutiveEvent(rawEvent, baseEvent);
    case 'city-meetings':
      return normalizeCityMeeting(rawEvent, baseEvent);
    default:
      // Use base normalizer for unknown source types
      return {
        ...baseEvent,
        title: baseEvent.title || '',
        description: baseEvent.description || '',
        date: baseEvent.date || new Date(),
        location: baseEvent.location || 'TBD',
        jurisdiction: baseEvent.jurisdiction || 'Unknown',
        agency: baseEvent.agency || '',
        url: baseEvent.url || '',
        virtual: baseEvent.virtual || false,
        tags: baseEvent.tags || [],
        id: 0
      };
  }
}