'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import EventCard from './EventCard';
import type { EventWithTags } from '@/lib/db-utils';
import type { EventFilter } from '@/lib/actions';
import { fetchEvents } from '@/lib/actions';

interface EventListClientProps {
  initialEvents: EventWithTags[];
  initialFilter: EventFilter;
}

export default function EventListClient({ initialEvents, initialFilter }: EventListClientProps) {
  const searchParams = useSearchParams();
  
  const [events, setEvents] = useState<EventWithTags[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(initialFilter);
  
  // Helper function to check if two filters are equivalent
  const areFiltersEqual = useCallback((a: EventFilter, b: EventFilter) => {
    return (
      a.jurisdiction === b.jurisdiction &&
      a.tag === b.tag &&
      a.searchTerm === b.searchTerm &&
      a.showVirtual === b.showVirtual &&
      a.sortBy === b.sortBy
    );
  }, []);

  // Extract filter from search params
  const getFilterFromSearchParams = useCallback(() => {
    return {
      jurisdiction: searchParams.get('jurisdiction') || 'All',
      tag: searchParams.get('tag') || undefined,
      searchTerm: searchParams.get('search') || '',
      showVirtual: searchParams.get('virtual') === 'true',
      sortBy: searchParams.get('sort') || 'date',
    };
  }, [searchParams]);

  // Function to fetch events
  const refreshEvents = useCallback(async (filter: EventFilter) => {
    try {
      setLoading(true);
      const updatedEvents = await fetchEvents(filter);
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update events when search params change
  useEffect(() => {
    const newFilter = getFilterFromSearchParams();
    
    // Skip if filter hasn't changed (prevents unnecessary refetches)
    if (areFiltersEqual(newFilter, currentFilter)) {
      return;
    }
    
    // Set new filter and update events
    setCurrentFilter(newFilter);
    refreshEvents(newFilter);
  }, [searchParams, currentFilter, areFiltersEqual, getFilterFromSearchParams, refreshEvents]);

  // Determine if any filters are active
  const hasActiveFilters = searchParams.toString() !== '';

  return (
    <div className="mt-6">
      {(hasActiveFilters || loading) && (
        <div className="mb-4 flex flex-wrap justify-between items-center">
          <div className="text-sm flex flex-wrap items-center gap-2">
            {loading ? (
              <span className="text-gray-500">Searching events...</span>
            ) : (
              <>
                <span className="font-medium">{events.length}</span> {events.length === 1 ? 'event' : 'events'} found 
                
                {currentFilter.jurisdiction !== 'All' && (
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium flex items-center">
                    Jurisdiction: {currentFilter.jurisdiction}
                  </span>
                )}
                
                {currentFilter.tag && (
                  <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-xs font-medium flex items-center">
                    Topic: {currentFilter.tag}
                  </span>
                )}
                
                {currentFilter.showVirtual && (
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md text-xs font-medium flex items-center">
                    Virtual Events Only
                  </span>
                )}
                
                {currentFilter.searchTerm && (
                  <span className="bg-gray-50 text-gray-700 px-2 py-0.5 rounded-md text-xs font-medium flex items-center">
                    Search: "{currentFilter.searchTerm}"
                  </span>
                )}
              </>
            )}
          </div>
          
          {events.length > 0 && currentFilter.sortBy && (
            <div className="text-xs text-gray-500">
              {currentFilter.sortBy === 'date' && 'Sorted by upcoming date'}
              {currentFilter.sortBy === 'date-desc' && 'Sorted by latest date'}
              {currentFilter.sortBy === 'title' && 'Sorted alphabetically'}
              {currentFilter.sortBy === 'jurisdiction' && 'Sorted by jurisdiction'}
            </div>
          )}
        </div>
      )}
      
      {loading ? (
        <div className="mt-6">
          <div className="animate-pulse space-y-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white shadow-sm border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/5"></div>
                  </div>
                  <div className="mt-4 flex space-x-1">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-3 bg-gray-200 rounded w-14"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow-sm border mt-6">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 mb-2">No events found matching your criteria.</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}