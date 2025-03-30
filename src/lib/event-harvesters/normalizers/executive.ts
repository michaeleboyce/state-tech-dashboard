import { RawEvent, EventWithTags } from '../types';
import { createBaseEvent } from './base';

export function normalizeExecutiveEvent(
  rawEvent: RawEvent, 
  baseEvent: Partial<EventWithTags>
): EventWithTags {
  // Executive events are typically from governor's office, agencies, etc.
  let tags = [...(baseEvent.tags || []), 'Executive'];
  
  // Add topic tags based on event content
  const topicTags = extractTopicTags(rawEvent);
  tags = [...tags, ...topicTags];
  
  return {
    ...baseEvent,
    title: baseEvent.title || '',
    description: baseEvent.description || '',
    date: baseEvent.date || new Date(),
    location: baseEvent.location || 'TBD',
    jurisdiction: baseEvent.jurisdiction || 'State',
    agency: baseEvent.agency || 'Executive Branch',
    url: baseEvent.url || '',
    virtual: baseEvent.virtual || false,
    tags: [...new Set(tags)], // Deduplicate tags
    id: 0
  };
}

function extractTopicTags(rawEvent: RawEvent): string[] {
  const tags: string[] = [];
  const fullText = `${rawEvent.title} ${rawEvent.description}`.toLowerCase();
  
  // Common executive event topics
  const topicMapping: Record<string, string[]> = {
    'Budget': ['budget', 'fiscal', 'funding', 'appropriation', 'financial'],
    'Infrastructure': ['infrastructure', 'roads', 'bridges', 'highway', 'transportation'],
    'Healthcare': ['healthcare', 'health', 'medical', 'hospital', 'medicaid', 'medicare'],
    'Education': ['education', 'school', 'university', 'college', 'student', 'teacher'],
    'Environment': ['environment', 'climate', 'pollution', 'conservation', 'sustainability'],
    'Economic Development': ['economic', 'economy', 'business', 'industry', 'jobs', 'workforce'],
    'Public Safety': ['safety', 'police', 'emergency', 'law enforcement', 'crime', 'criminal justice'],
    'Press Conference': ['press', 'media', 'statement', 'announcement', 'announces', 'unveils'],
    // Technology-related topics
    'Technology': ['technology', 'tech', 'innovation', 'digital', 'modernization', 'it ', 'information technology'],
    'Cybersecurity': ['cybersecurity', 'cyber', 'security', 'hack', 'breach', 'data security', 'privacy'],
    'Broadband': ['broadband', 'internet', 'connectivity', 'digital divide', 'high-speed internet'],
    'AI': ['ai', 'artificial intelligence', 'machine learning', 'automation', 'algorithm'],
    'Open Data': ['open data', 'data portal', 'transparency', 'data sharing', 'public data'],
    'Smart City': ['smart city', 'smart cities', 'iot', 'internet of things', 'sensors', 'connected']
  };
  
  // Check if text contains any of the keywords
  for (const [topic, keywords] of Object.entries(topicMapping)) {
    if (keywords.some(keyword => fullText.includes(keyword))) {
      tags.push(topic);
    }
  }
  
  return tags;
}