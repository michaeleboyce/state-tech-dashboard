import { fetchEvents, fetchTags } from '@/lib/actions';
import FilterBarClient from '@/components/FilterBarClient';
import EventListClient from '@/components/EventListClient';

export default async function Home({
  searchParams,
}: {
  searchParams: { jurisdiction?: string; tag?: string; search?: string; virtual?: string; sort?: string };
}) {
  // Extract filter parameters from URL search params
  const filter = {
    jurisdiction: searchParams.jurisdiction || 'All',
    tag: searchParams.tag,
    searchTerm: searchParams.search || '',
    showVirtual: searchParams.virtual === 'true',
    sortBy: searchParams.sort || 'date',
  };

  // Fetch events and tags in parallel
  const [events, tags] = await Promise.all([
    fetchEvents(filter),
    fetchTags(),
  ]);

  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Upcoming Technology Events in State & Local Governments</h2>
        <p className="text-gray-600">
          Browse through upcoming technology-related events, conferences, and meetings in state and local governments across the United States.
        </p>
      </div>

      <FilterBarClient 
        initialFilter={filter} 
        availableTags={tags} 
      />
      
      <EventListClient 
        initialEvents={events} 
        initialFilter={filter} 
      />

      <div className="mt-16 border-t pt-6 text-sm text-gray-500">
        <h3 className="font-medium mb-2">About This Dashboard</h3>
        <p className="mb-2">
          This dashboard displays upcoming technology-related events and initiatives in state and local governments 
          across the United States. The events shown include conferences, planning sessions, workshops, and other 
          government technology events.
        </p>
        <p>
          The data displayed is based on research of current government technology trends and initiatives. 
          Events focus on areas like digital government services, cybersecurity, cloud migration, 
          smart cities, data privacy, IT modernization, and digital inclusion.
        </p>
      </div>
    </div>
  );
}