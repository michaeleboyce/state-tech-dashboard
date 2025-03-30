import { RawEvent, EventWithTags } from '../types';
import { createBaseEvent } from './base';

export function normalizeCityMeeting(
  rawEvent: RawEvent, 
  baseEvent: Partial<EventWithTags>
): EventWithTags {
  // City meetings are local government events
  let tags = [...(baseEvent.tags || []), 'Local Government', 'City Meeting'];
  
  // Extract city name if possible
  const cityName = extractCityName(rawEvent);
  if (cityName) {
    tags.push(cityName);
  }
  
  // Extract meeting type
  const meetingType = extractMeetingType(rawEvent);
  if (meetingType) {
    tags.push(meetingType);
  }
  
  return {
    ...baseEvent,
    title: baseEvent.title || '',
    description: baseEvent.description || '',
    date: baseEvent.date || new Date(),
    location: baseEvent.location || 'City Hall',
    jurisdiction: baseEvent.jurisdiction || 'Local',
    agency: baseEvent.agency || 'City Government',
    url: baseEvent.url || '',
    virtual: baseEvent.virtual || false,
    tags: [...new Set(tags)], // Deduplicate tags
    id: 0
  };
}

function extractCityName(rawEvent: RawEvent): string | null {
  // Try to extract city name from source
  if (rawEvent.source) {
    const cityMatch = rawEvent.source.match(/^([a-z]{2})-(.+?)(?:-|$)/i);
    if (cityMatch && cityMatch[2]) {
      // Convert format like "nyc-public-meetings" to "New York City"
      const cityCode = cityMatch[2].toLowerCase();
      
      // Common city codes
      const cityCodes: Record<string, string> = {
        'nyc': 'New York City',
        'la': 'Los Angeles',
        'chicago': 'Chicago',
        'houston': 'Houston',
        'philly': 'Philadelphia',
        'philadelphia': 'Philadelphia',
        'phoenix': 'Phoenix',
        'sd': 'San Diego',
        'dallas': 'Dallas',
        'sf': 'San Francisco'
      };
      
      return cityCodes[cityCode] || cityCode.split('-').map(
        word => word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }
  
  // Try to extract from title or description
  const fullText = `${rawEvent.title} ${rawEvent.description}`;
  const cityPattern = /(?:city of|in) ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i;
  const match = fullText.match(cityPattern);
  
  return match ? match[1] : null;
}

function extractMeetingType(rawEvent: RawEvent): string | null {
  // Common meeting types in local government
  const meetingTypes = [
    'City Council',
    'Planning Commission',
    'Zoning Board',
    'Budget Committee',
    'Public Hearing',
    'Town Hall',
    'Community Meeting',
    'Board Meeting',
    'Committee Meeting',
    'Special Session',
    'Working Group',
    'Task Force'
  ];
  
  const fullText = `${rawEvent.title} ${rawEvent.description}`.toLowerCase();
  
  for (const type of meetingTypes) {
    if (fullText.includes(type.toLowerCase())) {
      return type;
    }
  }
  
  // Try to extract meeting type using pattern
  const meetingPattern = /(\w+\s+(?:meeting|hearing|session|board|commission|committee))/i;
  const match = fullText.match(meetingPattern);
  
  return match ? match[1] : null;
}