import { RawEvent, EventWithTags } from '../types';

// Basic sanitization functions
export function cleanDescription(description: string): string {
  if (!description) return '';
  
  return description
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/&[#\w]+;/g, match => { // Convert HTML entities
      const entities: Record<string, string> = {
        '&#x26;': '&',
        '&#x27;': "'",
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&apos;': "'"
      };
      return entities[match] || match;
    })
    .trim();
}

export function isVirtualEvent(event: RawEvent): boolean {
  const keywords = ['virtual', 'online', 'zoom', 'teams', 'webex', 'remote', 'webinar'];
  const text = `${event.title} ${event.description}`.toLowerCase();
  return keywords.some(keyword => text.includes(keyword));
}

export function extractBaseTags(event: RawEvent): string[] {
  const tags: string[] = [];
  
  // Extract from categories
  if (event.category) {
    const categories = Array.isArray(event.category) 
      ? event.category 
      : [event.category];
    
    categories.forEach(category => {
      if (typeof category === 'string') {
        // Split categories like "SECOND CONSIDERATION|JUDICIARY BILLS"
        const parts = category.split(/[|,;]/);
        tags.push(...parts.map(p => p.trim()));
      }
    });
  }
  
  // Add state tag
  if (event.source) {
    const stateMatch = event.source.match(/^([a-z]{2})-/i);
    if (stateMatch) {
      tags.push(stateMatch[1].toUpperCase());
    }
  }
  
  // Extract tech-related tags
  const techTags = extractTechTags(event);
  if (techTags.length > 0) {
    tags.push(...techTags);
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

// Function to identify and extract technology-related tags from event content
export function extractTechTags(event: RawEvent): string[] {
  const tags: string[] = [];
  const fullText = `${event.title} ${event.description}`.toLowerCase();
  
  // Technology-related keywords and their corresponding tags
  const techKeywords: Record<string, string[]> = {
    'Information Technology': ['it ', 'information technology', 'technology services', 'tech department'],
    'Cybersecurity': ['cybersecurity', 'cyber security', 'security breach', 'ransomware', 'malware', 'phishing'],
    'Digital Services': ['digital services', 'e-government', 'digital government', 'online services'],
    'Data Management': ['data management', 'data governance', 'database', 'data warehouse', 'data lake'],
    'Cloud Computing': ['cloud', 'aws', 'azure', 'google cloud', 'cloud migration', 'iaas', 'paas', 'saas'],
    'Network Infrastructure': ['network', 'infrastructure', 'broadband', 'internet access', 'connectivity'],
    'Software Development': ['software', 'development', 'programming', 'code', 'application development'],
    'Enterprise Architecture': ['enterprise architecture', 'it architecture', 'system design'],
    'AI & Machine Learning': ['artificial intelligence', 'machine learning', 'ai', 'ml', 'automation', 'chatbot'],
    'Blockchain': ['blockchain', 'distributed ledger', 'smart contract'],
    'IT Procurement': ['procurement', 'contract', 'vendor', 'rfp', 'acquisition'],
    'Digital Inclusion': ['digital divide', 'digital inclusion', 'digital literacy', 'technology access'],
    'Open Data': ['open data', 'data portal', 'transparency', 'public data'],
    'IT Modernization': ['modernization', 'legacy system', 'system upgrade', 'technology refresh']
  };
  
  // Check for tech-related keywords in the event content
  for (const [tag, keywords] of Object.entries(techKeywords)) {
    if (keywords.some(keyword => fullText.includes(keyword))) {
      tags.push(tag);
    }
  }
  
  // Special case: If the event is from a tech agency, add a technology tag
  if (event.agency && /technology|IT|information|digital|cyber/i.test(event.agency)) {
    tags.push('Technology');
  }
  
  return tags;
}

// Creates a basic event with common properties
export function createBaseEvent(rawEvent: RawEvent, jurisdiction: string): Partial<EventWithTags> {
  return {
    title: rawEvent.title,
    description: cleanDescription(rawEvent.description),
    date: rawEvent.date,
    location: rawEvent.location || 'TBD',
    url: rawEvent.link,
    jurisdiction: jurisdiction,
    agency: rawEvent.agency || '',
    virtual: isVirtualEvent(rawEvent),
    tags: extractBaseTags(rawEvent)
  };
}