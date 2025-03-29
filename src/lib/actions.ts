'use server';

import { getAllEvents, getAllTags } from './db-utils';
import type { EventWithTags } from './db-utils';
import { revalidatePath } from 'next/cache';

export type EventFilter = {
  jurisdiction?: string;
  tag?: string;
  showVirtual?: boolean;
  searchTerm?: string;
  sortBy?: string;
};

/**
 * Server action to fetch events from the database with filtering
 */
export async function fetchEvents(filter: EventFilter = {}): Promise<EventWithTags[]> {
  try {
    // Fetch all events from the database
    const events = await getAllEvents();

    // Filter the events based on search parameters
    const filteredEvents = events.filter((event) => {
      // Filter by jurisdiction if specified
      if (filter.jurisdiction && filter.jurisdiction !== 'All' && event.jurisdiction !== filter.jurisdiction) {
        return false;
      }
      
      // Filter by tag if specified
      if (filter.tag && !event.tags.includes(filter.tag)) {
        return false;
      }
      
      // Filter by virtual status if specified
      if (filter.showVirtual && !event.virtual) {
        return false;
      }
      
      // Filter by search term if specified
      if (filter.searchTerm) {
        const searchTerms = filter.searchTerm.toLowerCase().trim().split(/\s+/);
        
        // For each search term, check if it's found in any of the searchable fields
        return searchTerms.every(term => {
          return (
            event.title.toLowerCase().includes(term) ||
            event.description.toLowerCase().includes(term) ||
            event.agency.toLowerCase().includes(term) ||
            event.location.toLowerCase().includes(term) ||
            event.tags.some(tag => tag.toLowerCase().includes(term))
          );
        });
      }
      
      return true;
    });

    // Sort the filtered events
    const sortedEvents = [...filteredEvents].sort((a, b) => {
      const sortBy = filter.sortBy || 'date';
      
      switch(sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'jurisdiction':
          // Sort first by jurisdiction, then by date
          return a.jurisdiction === b.jurisdiction
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : a.jurisdiction.localeCompare(b.jurisdiction);
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    // Ensure the page gets revalidated when new filters are applied
    revalidatePath('/');
    
    return sortedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

/**
 * Server action to fetch all unique tags
 */
export async function fetchTags(): Promise<string[]> {
  try {
    return await getAllTags();
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}