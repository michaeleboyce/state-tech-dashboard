import { EventWithTags } from '@/lib/db-utils';
import { format, isPast, isFuture, formatDistanceToNow } from 'date-fns';

interface EventCardProps {
  event: EventWithTags;
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);
  const isUpcoming = isFuture(eventDate);
  const isPastEvent = isPast(eventDate);
  
  return (
    <div className={`border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow ${isPastEvent ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-primary">{event.title}</h3>
        <div className="flex gap-1">
          {event.virtual && (
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Virtual
            </span>
          )}
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {event.jurisdiction}
          </span>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
      <div className="flex flex-col space-y-2 text-sm">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {format(eventDate, 'MMMM d, yyyy')}
            {isUpcoming && (
              <span className="text-green-600 ml-2">
                (in {formatDistanceToNow(eventDate)})
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className={event.virtual ? 'text-purple-700 font-medium' : ''}>
            {event.location}
          </span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>{event.agency}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1">
        {event.tags.map((tag) => (
          <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>
      {event.url && (
        <div className="mt-4">
          <a 
            href={event.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm font-medium flex items-center"
          >
            <span>Learn more</span>
            <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}