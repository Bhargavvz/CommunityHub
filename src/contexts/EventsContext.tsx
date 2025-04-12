import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizer: string;
  category: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventNotification {
  id: string;
  eventId: string;
  title: string;
  message: string;
  date: string; // ISO date string
  read: boolean;
  type: 'event' | 'reminder' | 'update';
}

interface EventsContextType {
  events: Event[];
  eventNotifications: EventNotification[];
  isLoading: boolean;
  getEvent: (id: string) => Event | undefined;
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

// Create the context
const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Sample event data - in a real app this would come from an API
const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Community Pool Party',
    description: 'Join us for a fun day at the community pool. Food and drinks provided.',
    date: new Date(Date.now() + 86400000 * 2), // 2 days from now
    location: 'Community Pool',
    organizer: 'Events Committee',
    category: 'Social',
    isPublic: true,
    createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
    updatedAt: new Date(Date.now() - 86400000 * 4), // 4 days ago
  },
  {
    id: '2',
    title: 'Annual General Meeting',
    description: 'Annual meeting to discuss community matters and elect new committee members.',
    date: new Date(Date.now() + 86400000 * 15), // 15 days from now
    location: 'Community Hall',
    organizer: 'Management Committee',
    category: 'Meeting',
    isPublic: true,
    createdAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
    updatedAt: new Date(Date.now() - 86400000 * 15), // 15 days ago
  },
  {
    id: '3',
    title: 'Yoga in the Park',
    description: 'Join us for a relaxing yoga session in the community garden.',
    date: new Date(Date.now() + 86400000 * 5), // 5 days from now
    location: 'Community Garden',
    organizer: 'Wellness Committee',
    category: 'Fitness',
    isPublic: true,
    createdAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
    updatedAt: new Date(Date.now() - 86400000 * 8), // 8 days ago
  },
];

// Sample notifications
const generateEventNotifications = (events: Event[]): EventNotification[] => {
  const notifications: EventNotification[] = [];
  
  events.forEach(event => {
    // New event notification
    notifications.push({
      id: uuidv4(),
      eventId: event.id,
      title: 'New Event',
      message: `"${event.title}" has been added to the calendar`,
      date: event.createdAt.toISOString(),
      read: false,
      type: 'event'
    });
    
    // Reminder notification for upcoming events (if within a week)
    const daysUntilEvent = Math.ceil((event.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilEvent > 0 && daysUntilEvent <= 7) {
      notifications.push({
        id: uuidv4(),
        eventId: event.id,
        title: 'Event Reminder',
        message: `"${event.title}" is happening ${daysUntilEvent === 1 ? 'tomorrow' : `in ${daysUntilEvent} days`}`,
        date: new Date(Date.now() - 86400000 * (Math.random() * 3)).toISOString(), // Random time within last 3 days
        read: Math.random() > 0.7, // 30% chance to be read already
        type: 'reminder'
      });
    }
    
    // Update notification (if the event was updated)
    if (event.updatedAt.getTime() > event.createdAt.getTime()) {
      notifications.push({
        id: uuidv4(),
        eventId: event.id,
        title: 'Event Updated',
        message: `"${event.title}" has been updated`,
        date: event.updatedAt.toISOString(),
        read: Math.random() > 0.5, // 50% chance to be read already
        type: 'update'
      });
    }
  });
  
  // Sort notifications by date (newest first)
  return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Provider component
export const EventsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [eventNotifications, setEventNotifications] = useState<EventNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize notifications based on events
  useEffect(() => {
    setEventNotifications(generateEventNotifications(events));
    setIsLoading(false);
  }, []);
  
  const getEvent = (id: string) => {
    return events.find(event => event.id === id);
  };
  
  const addEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newEvent: Event = {
      ...eventData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    
    // In a real app, this would be an API call
    setEvents(prevEvents => [...prevEvents, newEvent]);
    
    // Create a notification for the new event
    const notification: EventNotification = {
      id: uuidv4(),
      eventId: newEvent.id,
      title: 'New Event',
      message: `"${newEvent.title}" has been added to the calendar`,
      date: now.toISOString(),
      read: false,
      type: 'event'
    };
    
    setEventNotifications(prev => [notification, ...prev]);
    
    return newEvent;
  };
  
  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    const now = new Date();
    const updatedEvent = { ...getEvent(id), ...eventData, updatedAt: now } as Event;
    
    // In a real app, this would be an API call
    setEvents(prevEvents => prevEvents.map(event => 
      event.id === id ? updatedEvent : event
    ));
    
    // Create a notification for the updated event
    const notification: EventNotification = {
      id: uuidv4(),
      eventId: id,
      title: 'Event Updated',
      message: `"${updatedEvent.title}" has been updated`,
      date: now.toISOString(),
      read: false,
      type: 'update'
    };
    
    setEventNotifications(prev => [notification, ...prev]);
    
    return updatedEvent;
  };
  
  const deleteEvent = async (id: string) => {
    // In a real app, this would be an API call
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    
    // Remove notifications for this event
    setEventNotifications(prev => prev.filter(notification => notification.eventId !== id));
  };
  
  const markNotificationAsRead = (id: string) => {
    setEventNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  const markAllNotificationsAsRead = () => {
    setEventNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  return (
    <EventsContext.Provider
      value={{
        events,
        eventNotifications,
        isLoading,
        getEvent,
        addEvent,
        updateEvent,
        deleteEvent,
        markNotificationAsRead,
        markAllNotificationsAsRead
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};

// Custom hook for using the context
export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}; 