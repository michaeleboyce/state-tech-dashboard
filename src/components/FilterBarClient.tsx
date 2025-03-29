'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { EventFilter } from '@/lib/actions';

interface FilterBarClientProps {
  initialFilter: EventFilter;
  availableTags: string[];
}

export default function FilterBarClient({ initialFilter, availableTags }: FilterBarClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [filter, setFilter] = useState(initialFilter);
  const [localSearchTerm, setLocalSearchTerm] = useState(initialFilter.searchTerm || '');
  const [expanded, setExpanded] = useState(false);
  
  // Sync with URL params when they change
  useEffect(() => {
    const currentFilter = {
      jurisdiction: searchParams.get('jurisdiction') || 'All',
      tag: searchParams.get('tag') || undefined,
      searchTerm: searchParams.get('search') || '',
      showVirtual: searchParams.get('virtual') === 'true',
      sortBy: searchParams.get('sort') || 'date',
    };
    
    setFilter(currentFilter);
    setLocalSearchTerm(currentFilter.searchTerm || '');
  }, [searchParams]);

  // Debounce search term to prevent excessive filtering
  useEffect(() => {
    // Skip if the search term hasn't changed from what's already in the URL
    if (localSearchTerm === filter.searchTerm) {
      return;
    }
    
    const timer = setTimeout(() => {
      updateUrl({ ...filter, searchTerm: localSearchTerm });
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, filter]);

  // Update the URL with the filter params
  const updateUrl = (newFilter: EventFilter) => {
    const params = new URLSearchParams(searchParams.toString());

    // Set or remove search params based on filter values
    if (newFilter.jurisdiction && newFilter.jurisdiction !== 'All') {
      params.set('jurisdiction', newFilter.jurisdiction);
    } else {
      params.delete('jurisdiction');
    }

    if (newFilter.tag) {
      params.set('tag', newFilter.tag);
    } else {
      params.delete('tag');
    }

    if (newFilter.searchTerm) {
      params.set('search', newFilter.searchTerm);
    } else {
      params.delete('search');
    }

    if (newFilter.showVirtual) {
      params.set('virtual', 'true');
    } else {
      params.delete('virtual');
    }

    if (newFilter.sortBy && newFilter.sortBy !== 'date') {
      params.set('sort', newFilter.sortBy);
    } else {
      params.delete('sort');
    }

    setFilter(newFilter);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    updateUrl({ ...filter, searchTerm: '' });
  };

  const handleClearAllFilters = () => {
    setLocalSearchTerm('');
    updateUrl({
      jurisdiction: 'All',
      searchTerm: '',
      tag: undefined,
      showVirtual: false,
      sortBy: 'date'
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Events
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              placeholder="Search by title, description, agency, or tags"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
            {localSearchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Search across event titles, descriptions, agencies, and tags
          </p>
        </div>
        <div>
          <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 mb-1">
            Jurisdiction
          </label>
          <select
            id="jurisdiction"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filter.jurisdiction}
            onChange={(e) => updateUrl({ ...filter, jurisdiction: e.target.value })}
          >
            <option value="All">All Jurisdictions</option>
            <option value="State">State</option>
            <option value="Local">Local</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center text-sm text-primary hover:text-primary/80 font-medium"
        >
          <span>{expanded ? 'Hide advanced filters' : 'Show advanced filters'}</span>
          <svg 
            className={`w-5 h-5 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expanded && (
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Topic
                </label>
                <select
                  id="tag"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={filter.tag || ''}
                  onChange={(e) => updateUrl({ ...filter, tag: e.target.value || undefined })}
                >
                  <option value="">All Topics</option>
                  {availableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={filter.sortBy || 'date'}
                  onChange={(e) => updateUrl({ ...filter, sortBy: e.target.value })}
                >
                  <option value="date">Date (Soonest First)</option>
                  <option value="date-desc">Date (Latest First)</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="jurisdiction">Jurisdiction</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="virtual"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={filter.showVirtual || false}
                onChange={(e) => updateUrl({ ...filter, showVirtual: e.target.checked })}
              />
              <label htmlFor="virtual" className="ml-2 block text-sm text-gray-700">
                Show only virtual events
              </label>
            </div>
            
            <div className="pt-3 border-t">
              <button
                onClick={handleClearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}