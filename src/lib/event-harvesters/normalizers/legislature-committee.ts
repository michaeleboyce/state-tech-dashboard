import { RawEvent, EventWithTags } from '../types';
import { createBaseEvent } from './base';

export function normalizeCommitteeEvent(
  rawEvent: RawEvent, 
  baseEvent: Partial<EventWithTags>
): EventWithTags {
  // Extract additional data from committee events
  let location = rawEvent.location || 'Pennsylvania State Capitol';
  let tags = [...(baseEvent.tags || []), 'Committee Meeting'];
  
  // Extract committee name
  const committeeName = extractCommitteeName(rawEvent.title);
  if (committeeName) {
    tags.push(committeeName);
  }
  
  // PA-specific: Extract bill information if available
  if (rawEvent.sourceData) {
    // Extract bill numbers, topics, etc.
    const billInfo = extractBillInfo(rawEvent.sourceData);
    if (billInfo.billNumber) {
      tags.push(`Bill ${billInfo.billNumber}`);
    }
    if (billInfo.topic) {
      tags.push(billInfo.topic);
    }
  }
  
  return {
    ...baseEvent,
    title: baseEvent.title || '',
    description: baseEvent.description || '',
    date: baseEvent.date || new Date(),
    location,
    jurisdiction: baseEvent.jurisdiction || 'State',
    agency: baseEvent.agency || 'Pennsylvania Legislature',
    url: baseEvent.url || '',
    virtual: baseEvent.virtual || false,
    tags: [...new Set(tags)], // Deduplicate tags
    id: 0 // This will be assigned by the database
  };
}

function extractCommitteeName(title: string): string | null {
  // Extract committee name from title
  // Example: "House Finance Committee Meeting"
  const committeePattern = /(.*?)\s(?:Committee|Commission)\s(?:Meeting|Hearing)/i;
  const match = title.match(committeePattern);
  
  if (match) {
    return match[1].trim();
  }
  
  // Look for committee patterns when not explicit
  const committeeKeywords = [
    'Finance', 'Judiciary', 'Transportation', 'Education', 
    'Health', 'Appropriations', 'Rules', 'Agriculture',
    'Commerce', 'Environment', 'Energy', 'Labor'
  ];
  
  for (const keyword of committeeKeywords) {
    if (title.includes(keyword)) {
      return keyword;
    }
  }
  
  return null;
}

function extractBillInfo(sourceData: any): { billNumber?: string, topic?: string } {
  // Extract bill information from source data
  const result: { billNumber?: string, topic?: string } = {};
  
  // Handle Pennsylvania House bill format
  if (sourceData.title) {
    const billMatch = sourceData.title.match(/(?:House|Senate)\s+Bill\s+(\d+)/i);
    if (billMatch) {
      result.billNumber = billMatch[1];
    }
  }
  
  // Extract topic from description or category
  if (sourceData.description) {
    // Many descriptions have common patterns like "Committee meeting regarding X"
    const regardingMatch = sourceData.description.match(/regarding\s+([^.]+)/i);
    if (regardingMatch) {
      result.topic = regardingMatch[1].trim();
    }
  }
  
  // Attempt to get topic from category if available
  if (sourceData.category && typeof sourceData.category === 'string') {
    // Categories often contain topics after a delimiter
    const parts = sourceData.category.split(/[|,;]/);
    if (parts.length > 1) {
      const potentialTopic = parts[parts.length - 1].trim();
      // Only use if it looks like a real topic
      if (potentialTopic.length > 3 && potentialTopic !== 'BILL') {
        result.topic = potentialTopic;
      }
    }
  }
  
  return result;
}