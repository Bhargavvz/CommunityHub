import { Request, Response } from 'express';
import { db } from '../config/firebase-admin';
import { logger } from '../utils/logger';
import { successResponse, errorResponse } from '../utils/response-handler';
import { asyncHandler } from '../utils/error-handler';

// Define Event interface
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  maxAttendees?: number;
  image?: string;
  isPublic: boolean;
  attendees?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Get all events with optional filtering
 * @route GET /api/events
 * @access Private
 */
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, limit = 100, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    // Get all events
    const snapshot = await db.collection('events').get();

    // Process events with filtering
    let events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
    
    // Apply manual filtering since Firestore query methods might not be available
    if (startDate) {
      events = events.filter(event => event.date >= String(startDate));
    }
    
    if (endDate) {
      events = events.filter(event => event.date <= String(endDate));
    }
    
    // Manual sorting by date
    events.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Manual pagination
    const totalCount = events.length;
    events = events.slice(offset, offset + Number(limit));
    
    return successResponse(res, 200, 'Events retrieved successfully', {
      events,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error: any) {
    logger.error('Error retrieving events:', error);
    return errorResponse(res, 500, 'Error retrieving events', error.message);
  }
});

/**
 * Get event by ID
 * @route GET /api/events/:id
 * @access Private
 */
export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    
    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      return errorResponse(res, 404, 'Event not found');
    }
    
    return successResponse(res, 200, 'Event retrieved successfully', {
      id: eventDoc.id,
      ...eventDoc.data()
    });
  } catch (error: any) {
    logger.error('Error retrieving event:', error);
    return errorResponse(res, 500, 'Error retrieving event', error.message);
  }
});

/**
 * Create a new event
 * @route POST /api/events
 * @access Private (Admin only)
 */
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { title, description, date, endDate, location, maxAttendees, image, isPublic = true } = req.body;
    
    if (!title || !description || !date || !location) {
      return errorResponse(res, 400, 'Title, description, date, and location are required');
    }
    
    const newEvent = {
      title,
      description,
      date: new Date(date).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
      location,
      maxAttendees: maxAttendees || null,
      image: image || null,
      isPublic,
      attendees: [],
      createdBy: req.user!.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const eventRef = await db.collection('events').add(newEvent);
    
    logger.info(`New event created: ${eventRef.id}`);
    
    return successResponse(res, 201, 'Event created successfully', {
      id: eventRef.id,
      ...newEvent
    });
  } catch (error: any) {
    logger.error('Error creating event:', error);
    return errorResponse(res, 500, 'Error creating event', error.message);
  }
});

/**
 * Update an event
 * @route PUT /api/events/:id
 * @access Private (Admin only)
 */
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const { title, description, date, endDate, location, maxAttendees, image, isPublic } = req.body;
    
    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      return errorResponse(res, 404, 'Event not found');
    }
    
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (date) updateData.date = new Date(date).toISOString();
    if (endDate) updateData.endDate = new Date(endDate).toISOString();
    if (location) updateData.location = location;
    if (maxAttendees !== undefined) updateData.maxAttendees = maxAttendees;
    if (image !== undefined) updateData.image = image;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    
    await db.collection('events').doc(eventId).update(updateData);
    
    logger.info(`Event updated: ${eventId}`);
    
    return successResponse(res, 200, 'Event updated successfully');
  } catch (error: any) {
    logger.error('Error updating event:', error);
    return errorResponse(res, 500, 'Error updating event', error.message);
  }
});

/**
 * Delete an event
 * @route DELETE /api/events/:id
 * @access Private (Admin only)
 */
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    
    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      return errorResponse(res, 404, 'Event not found');
    }
    
    await db.collection('events').doc(eventId).delete();
    
    logger.info(`Event deleted: ${eventId}`);
    
    return successResponse(res, 200, 'Event deleted successfully');
  } catch (error: any) {
    logger.error('Error deleting event:', error);
    return errorResponse(res, 500, 'Error deleting event', error.message);
  }
});

/**
 * RSVP to an event
 * @route POST /api/events/:id/rsvp
 * @access Private
 */
export const rsvpToEvent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.user!.uid;
    
    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      return errorResponse(res, 404, 'Event not found');
    }
    
    const eventData = eventDoc.data();
    const attendees = eventData?.attendees || [];
    
    // Check if user already RSVP'd
    if (attendees.includes(userId)) {
      return errorResponse(res, 400, 'You have already RSVP\'d to this event');
    }
    
    // Check if event has reached maximum attendees
    if (eventData?.maxAttendees && attendees.length >= eventData.maxAttendees) {
      return errorResponse(res, 400, 'Event has reached maximum attendees');
    }
    
    // Add user to attendees list
    await db.collection('events').doc(eventId).update({
      attendees: [...attendees, userId],
      updatedAt: new Date().toISOString()
    });
    
    logger.info(`User ${userId} RSVP'd to event ${eventId}`);
    
    return successResponse(res, 200, 'RSVP successful');
  } catch (error: any) {
    logger.error('Error RSVP\'ing to event:', error);
    return errorResponse(res, 500, 'Error RSVP\'ing to event', error.message);
  }
});

/**
 * Cancel RSVP to an event
 * @route DELETE /api/events/:id/rsvp
 * @access Private
 */
export const cancelRsvp = asyncHandler(async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.user!.uid;
    
    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      return errorResponse(res, 404, 'Event not found');
    }
    
    const eventData = eventDoc.data();
    const attendees = eventData?.attendees || [];
    
    // Check if user has RSVP'd
    if (!attendees.includes(userId)) {
      return errorResponse(res, 400, 'You have not RSVP\'d to this event');
    }
    
    // Remove user from attendees list
    await db.collection('events').doc(eventId).update({
      attendees: attendees.filter((id: string) => id !== userId),
      updatedAt: new Date().toISOString()
    });
    
    logger.info(`User ${userId} canceled RSVP to event ${eventId}`);
    
    return successResponse(res, 200, 'RSVP canceled successfully');
  } catch (error: any) {
    logger.error('Error canceling RSVP:', error);
    return errorResponse(res, 500, 'Error canceling RSVP', error.message);
  }
}); 