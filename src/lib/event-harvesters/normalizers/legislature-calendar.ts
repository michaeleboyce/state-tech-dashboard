import { RawEvent, EventWithTags } from '../types';
import { createBaseEvent } from './base';

export function normalizeCalendarEvent(
  rawEvent: RawEvent, 
  baseEvent: Partial<EventWithTags>
): EventWithTags {
  // For PA House Calendar items, these are bills scheduled for consideration
  let tags = [...(baseEvent.tags || []), 'Legislative Session', 'Bill Consideration'];
  
  // Extract bill info from title (House Bill 156 Printer's Number 1047)
  const billMatch = rawEvent.title.match(/(?:House|Senate)\s+Bill\s+(\d+)/i);
  if (billMatch) {
    tags.push(`Bill ${billMatch[1]}`);
  }
  
  // Extract committee/category from category or description
  let committeeTag = extractCommittee(rawEvent);
  if (committeeTag) {
    tags.push(committeeTag);
  }
  
  return {
    ...baseEvent,
    title: baseEvent.title || '',
    description: baseEvent.description || '',
    date: baseEvent.date || new Date(),
    location: baseEvent.location || 'State Capitol',
    jurisdiction: baseEvent.jurisdiction || 'State',
    agency: baseEvent.agency || 'Legislature',
    url: baseEvent.url || '',
    virtual: baseEvent.virtual || false,
    tags: [...new Set(tags)], // Deduplicate tags
    id: 0
  };
}

function extractCommittee(rawEvent: RawEvent): string | null {
  // Try to extract committee info from category
  if (typeof rawEvent.category === 'string') {
    const categories = rawEvent.category.split('|');
    
    // Look for committee names in categories
    for (const cat of categories) {
      const trimmed = cat.trim();
      
      // Common format in PA legislature: SECOND CONSIDERATION|CHILDREN & YOUTH BILL
      if (trimmed.includes('&') || /[A-Z\s]+\sBILL/.test(trimmed)) {
        return trimmed;
      }
      
      // Check for committee keywords
      const committeeKeywords = [
        'FINANCE', 'JUDICIARY', 'TRANSPORTATION', 'EDUCATION', 
        'HEALTH', 'APPROPRIATIONS', 'RULES', 'AGRICULTURE',
        'COMMERCE', 'ENVIRONMENT', 'ENERGY', 'LABOR'
      ];
      
      for (const keyword of committeeKeywords) {
        if (trimmed.includes(keyword)) {
          return trimmed;
        }
      }
    }
  }
  
  // Try to extract from description
  if (rawEvent.description) {
    const descLines = rawEvent.description.split('-');
    if (descLines.length > 1) {
      const lastLine = descLines[descLines.length - 1].trim();
      
      if (lastLine.length > 3 && lastLine.length < 100) {
        return lastLine;
      }
    }
  }
  
  return null;
}