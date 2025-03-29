import { useEffect, useState } from 'react';
import { events } from '@/lib/events-data';

// Extract all unique tags from events
const allTags = Array.from(
  new Set(events.flatMap(event => event.tags))
).sort();

interface FilterBarProps {
  filter: {
    jurisdiction: string;
    searchTerm: string;
    tag?: string;
    showVirtual?: boolean;
    sortBy?: string;
  };
  setFilter: (filter: {
    jurisdiction: string;
    searchTerm: string;
    tag?: string;
    showVirtual?: boolean;
    sortBy?: string;
  }) => void;
}

export default function FilterBar({ filter, setFilter }: FilterBarProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(filter.searchTerm);
  const [expanded, setExpanded] = useState(false);

  // Debounce search term to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter({ ...filter, searchTerm: localSearchTerm });
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm]);

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    setFilter({ ...filter, searchTerm: '' });
  };

  const handleClearAllFilters = () => {
    setLocalSearchTerm('');
    setFilter({
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
            onChange={(e) => setFilter({ ...filter, jurisdiction: e.target.value })}
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
                  onChange={(e) => setFilter({ ...filter, tag: e.target.value || undefined })}
                >
                  <option value="">All Topics</option>
                  {allTags.map(tag => (
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
                  onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
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
                onChange={(e) => setFilter({ ...filter, showVirtual: e.target.checked })}
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