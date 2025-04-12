import { Router } from 'express';
import { 
  getAllResidents, 
  getResidentById, 
  createResident, 
  updateResident, 
  deleteResident 
} from '../controllers/residentController';
import { verifyAuth, verifyAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/residents
 * @desc Get all residents
 * @access Private (Admin)
 */
router.get('/', verifyAuth, verifyAdmin, getAllResidents);

/**
 * @route GET /api/residents/:id
 * @desc Get a resident by ID
 * @access Private (Admin and resident themselves)
 */
router.get('/:id', verifyAuth, getResidentById);

/**
 * @route POST /api/residents
 * @desc Create a new resident
 * @access Private (Admin)
 */
router.post('/', verifyAuth, verifyAdmin, createResident);

/**
 * @route PUT /api/residents/:id
 * @desc Update a resident
 * @access Private (Admin and resident themselves)
 */
router.put('/:id', verifyAuth, updateResident);

/**
 * @route DELETE /api/residents/:id
 * @desc Delete a resident
 * @access Private (Admin)
 */
router.delete('/:id', verifyAuth, verifyAdmin, deleteResident);

export default router; 