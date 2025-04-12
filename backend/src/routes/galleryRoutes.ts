import { Router } from 'express';
import {
  getGalleryImages,
  getGalleryImageById,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage
} from '../controllers/galleryController';
import { verifyAuth, verifyAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/gallery
 * @desc Get all gallery images with optional filtering
 * @access Private
 */
router.get('/', verifyAuth, getGalleryImages);

/**
 * @route GET /api/gallery/:id
 * @desc Get gallery image by ID
 * @access Private
 */
router.get('/:id', verifyAuth, getGalleryImageById);

/**
 * @route POST /api/gallery
 * @desc Create a new gallery image
 * @access Private (Admin)
 */
router.post('/', verifyAuth, verifyAdmin, createGalleryImage);

/**
 * @route PUT /api/gallery/:id
 * @desc Update a gallery image
 * @access Private (Admin)
 */
router.put('/:id', verifyAuth, verifyAdmin, updateGalleryImage);

/**
 * @route DELETE /api/gallery/:id
 * @desc Delete a gallery image
 * @access Private (Admin)
 */
router.delete('/:id', verifyAuth, verifyAdmin, deleteGalleryImage);

export default router; 