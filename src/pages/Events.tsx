import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Clock,
  PlusCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  UserPlus,
  LogOut
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO
} from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../components/common/ConfirmationModal';
import EventModal from '../components/events/EventModal';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  maxAttendees?: number;
  attendees: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/events');
      setEvents(response.data.data.events);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to load events');
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRsvp = async (eventId: string) => {
    try {
      setRsvpLoading(eventId);
      await axios.post(`/api/events/${eventId}/rsvp`);
      
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                attendees: [...(event.attendees || []), currentUser?.id as string] 
              } 
            : event
        )
      );
      
      toast.success('RSVP successful!');
    } catch (err: any) {
      console.error('Error RSVPing to event:', err);
      toast.error(err.response?.data?.message || 'Failed to RSVP');
    } finally {
      setRsvpLoading(null);
    }
  };

  const handleCancelRsvp = async (eventId: string) => {
    try {
      setRsvpLoading(eventId);
      await axios.delete(`/api/events/${eventId}/rsvp`);
      
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                attendees: (event.attendees || []).filter(id => id !== currentUser?.id) 
              } 
            : event
        )
      );
      
      toast.success('RSVP canceled');
    } catch (err: any) {
      console.error('Error canceling RSVP:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel RSVP');
    } finally {
      setRsvpLoading(null);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const isUserRsvp = (event: Event) => {
    return currentUser && event.attendees?.includes(currentUser.id);
  };

  const isEventFull = (event: Event) => {
    return typeof event.maxAttendees === 'number' && 
           event.attendees && 
           event.attendees.length >= event.maxAttendees;
  };

  const handleCreate = () => {
    setSelectedEvent(null);
    setShowCreateModal(true);
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await axios.delete(`/api/events/${eventToDelete}`);
      toast.success('Event deleted successfully!');
      setEvents(prev => prev.filter(e => e.id !== eventToDelete));
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error('Failed to delete event.');
      setShowDeleteModal(false);
    }
  };

  const handleSaveEvent = async (eventData: any) => { 
    setIsSaving(true);
    try {
      let response: any; 
      if (selectedEvent?.id) {
        response = await axios.put<{ success: boolean; data: Event }>(`/api/events/${selectedEvent.id}`, eventData); 
        setEvents(prev => prev.map(e => e.id === selectedEvent.id ? response.data.data : e));
        toast.success('Event updated successfully!');
        setShowEditModal(false);
      } else {
        response = await axios.post<{ success: boolean; data: Event }>( '/api/events', eventData); 
        setEvents(prev => [response.data.data, ...prev]);
        toast.success('Event created successfully!');
        setShowCreateModal(false);
      }
      setSelectedEvent(null);
    } catch (err: any) {
      console.error("Error saving event:", err);
      toast.error(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-center">
      {error}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-primary/30 backdrop-blur-md border border-glass-border shadow-lg rounded-glass p-8 mb-12 md:flex md:items-center md:justify-between relative overflow-hidden"
      >
        {/* Background elements for visual interest */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-accent/10 rounded-full blur-xl"></div>
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-primary/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-heading text-white">Community Events</h1>
          <p className="mt-2 text-sm text-gray-100">Connect and engage with your neighbors at Eastern Green Homes events.</p>
        </div>

        {isAdmin && (
          <div className="mt-4 relative z-10 md:mt-0 md:ml-4">
            <motion.button 
              type="button" 
              onClick={handleCreate}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center px-5 py-2.5 bg-accent text-primary rounded-lg shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition gap-2 font-medium"
            >
              <PlusCircle size={18} />
              Create Event
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Filter/Sort Controls could go here */}
      <h2 className="text-2xl font-heading font-semibold text-primary mb-6">Upcoming Events</h2>

      {events.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-sm rounded-glass p-10 text-center border border-glass-border">
          <p className="text-gray-500 text-lg">No upcoming events planned yet.</p>
          {isAdmin && (
            <button
              onClick={handleCreate}
              className="mt-4 inline-flex items-center px-4 py-2 bg-primary/80 text-white rounded-lg text-sm hover:bg-primary transition gap-2"
            >
              <PlusCircle size={16} />
              Schedule an Event
            </button>
          )}
        </div>
      ) : (
        /* Grid Layout for Event Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group bg-white/70 backdrop-blur-sm border border-glass-border shadow-md rounded-glass overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Event Image */}
              {event.imageUrl ? (
                <div className="relative w-full h-48 overflow-hidden">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-r from-primary/20 to-secondary/20 flex justify-center items-center">
                  <CalendarIcon size={32} className="text-primary/40" />
                </div>
              )}
              
              {/* Event Content */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">{event.description}</p>
                  
                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start text-sm text-text-secondary">
                      <CalendarIcon size={16} className="mr-2 flex-shrink-0 mt-0.5 text-primary" />
                      <span>
                        {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')} at {format(parseISO(event.date), 'h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-start text-sm text-text-secondary">
                      <MapPin size={16} className="mr-2 flex-shrink-0 mt-0.5 text-primary" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-start text-sm text-text-secondary">
                      <Users size={16} className="mr-2 flex-shrink-0 mt-0.5 text-primary" />
                      <span>
                        {event.attendees?.length || 0} 
                        {event.maxAttendees && ` / ${event.maxAttendees}`} attendees
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(event)} 
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition"
                        aria-label="Edit event"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(event.id)} 
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition"
                        aria-label="Delete event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  
                  {isUserRsvp(event) ? (
                    <button
                      onClick={() => handleCancelRsvp(event.id)}
                      disabled={!!rsvpLoading}
                      className="flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition ml-auto"
                    >
                      {rsvpLoading === event.id ? (
                        <Loader2 className="animate-spin h-4 w-4 mr-1" />
                      ) : (
                        <LogOut className="h-4 w-4 mr-1" />
                      )}
                      Cancel RSVP
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRsvp(event.id)}
                      disabled={!!rsvpLoading || isEventFull(event)}
                      className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg ml-auto ${
                        isEventFull(event)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-primary/80 text-white hover:bg-primary transition'
                      }`}
                    >
                      {rsvpLoading === event.id ? (
                        <Loader2 className="animate-spin h-4 w-4 mr-1" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-1" />
                      )}
                      {isEventFull(event) ? 'Event Full' : 'RSVP'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Modals - Keep these as they are */}
      {showCreateModal && (
        <EventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveEvent}
          isSaving={isSaving}
          event={null}
        />
      )}
      
      {showEditModal && selectedEvent && (
        <EventModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEvent}
          isSaving={isSaving}
          event={selectedEvent}
        />
      )}
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}