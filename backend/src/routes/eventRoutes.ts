import { Router } from 'express';
import { 
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpToEvent,
  cancelRsvp
} from '../controllers/eventController';
import { verifyAuth, verifyAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/events
 * @desc Get all events with optional filtering
 * @access Private
 */
router.get('/', verifyAuth, getEvents);

/**
 * @route GET /api/events/:id
 * @desc Get an event by ID
 * @access Private
 */
router.get('/:id', verifyAuth, getEventById);

/**
 * @route POST /api/events
 * @desc Create a new event
 * @access Private (Admin)
 */
router.post('/', verifyAuth, verifyAdmin, createEvent);

/**
 * @route PUT /api/events/:id
 * @desc Update an event
 * @access Private (Admin)
 */
router.put('/:id', verifyAuth, verifyAdmin, updateEvent);

/**
 * @route DELETE /api/events/:id
 * @desc Delete an event
 * @access Private (Admin)
 */
router.delete('/:id', verifyAuth, verifyAdmin, deleteEvent);

/**
 * @route POST /api/events/:id/rsvp
 * @desc RSVP to an event
 * @access Private
 */
router.post('/:id/rsvp', verifyAuth, rsvpToEvent);

/**
 * @route DELETE /api/events/:id/rsvp
 * @desc Cancel RSVP to an event
 * @access Private
 */
router.delete('/:id/rsvp', verifyAuth, cancelRsvp);

export default router; 