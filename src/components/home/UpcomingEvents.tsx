import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { format, parseISO, isFuture } from 'date-fns';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Event Interface
interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  endDate?: string; // Optional ISO string
  location: string;
  attendees?: string[]; // Array of user IDs
  maxAttendees?: number;
  createdBy: string;
  image?: string;
  isPublic: boolean;
}

const UpcomingEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from the API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/events');
        
        // Filter future events and sort by date
        const allEvents = response.data.data.events as Event[];
        const upcomingEvents = allEvents
          .filter(event => isFuture(parseISO(event.date)))
          .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
          .slice(0, 4); // Get only the next 4 events
        
        setEvents(upcomingEvents);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching events for homepage:', err);
        setError('Failed to load upcoming events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Default image to use when event has no image
  const defaultImage = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=300';

  return (
    <section className="bg-surface py-16 sm:py-20"> {/* Use surface color for section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">
            Upcoming Events
          </h2>
          <Link 
            to="/events" 
            className="inline-flex items-center text-sm font-semibold text-secondary hover:text-primary transition-colors duration-150"
          >
            View Calendar
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-2 text-text-secondary">Loading events...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 text-center">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-100">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming events</h3>
            <p className="text-gray-500">Check back later for future community events.</p>
          </div>
        ) : (
          /* Basic horizontal scroll container (replace with slider later) */
          <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"> 
            <div className="flex space-x-6">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="group min-w-[300px] flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <img 
                    className="h-40 w-full object-cover" 
                    src={event.image || defaultImage} 
                    alt={`${event.title} event image`}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-primary mb-2 group-hover:text-secondary transition-colors duration-150">{event.title}</h3>
                    <div className="space-y-1.5 text-sm text-text-secondary">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(parseISO(event.date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{format(parseISO(event.date), 'h:mm a')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Link 
                      to={`/events?date=${format(parseISO(event.date), 'yyyy-MM-dd')}`}
                      className="mt-4 inline-flex items-center text-xs font-semibold text-secondary uppercase tracking-wider hover:underline"
                    >
                      View Details <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingEvents; 