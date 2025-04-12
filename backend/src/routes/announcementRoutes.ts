import { Router } from 'express';
import { 
  getAnnouncements, 
  getAnnouncementById, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} from '../controllers/announcementController';
import { verifyAuth, verifyAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/announcements
 * @desc Get all announcements with optional filtering
 * @access Private
 */
router.get('/', verifyAuth, getAnnouncements);

/**
 * @route GET /api/announcements/:id
 * @desc Get an announcement by ID
 * @access Private
 */
router.get('/:id', verifyAuth, getAnnouncementById);

/**
 * @route POST /api/announcements
 * @desc Create a new announcement
 * @access Private (Admin)
 */
router.post('/', verifyAuth, verifyAdmin, createAnnouncement);

/**
 * @route PUT /api/announcements/:id
 * @desc Update an announcement
 * @access Private (Admin)
 */
router.put('/:id', verifyAuth, verifyAdmin, updateAnnouncement);

/**
 * @route DELETE /api/announcements/:id
 * @desc Delete an announcement
 * @access Private (Admin)
 */
router.delete('/:id', verifyAuth, verifyAdmin, deleteAnnouncement);

export default router; 