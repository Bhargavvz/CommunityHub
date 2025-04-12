import { Request, Response } from 'express';
import { db } from '../config/firebase-admin';
import { logger } from '../utils/logger';
import { successResponse, errorResponse } from '../utils/response-handler';
import { asyncHandler } from '../utils/error-handler';

// Define GalleryImage interface
interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Get all gallery images with optional filtering
 * @route GET /api/gallery
 * @access Private
 */
export const getGalleryImages = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { category, limit = 100, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    // Get all gallery images
    const snapshot = await db.collection('gallery').get();

    // Process images with filtering
    let images = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GalleryImage[];
    
    // Apply category filter if provided
    if (category) {
      images = images.filter(img => img.category === category);
    }
    
    // Sort by uploadedAt date, newest first
    images.sort((a, b) => {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
    
    // Manual pagination
    const totalCount = images.length;
    images = images.slice(offset, offset + Number(limit));
    
    return successResponse(res, 200, 'Gallery images retrieved successfully', {
      images,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error: any) {
    logger.error('Error retrieving gallery images:', error);
    return errorResponse(res, 500, 'Error retrieving gallery images', error.message);
  }
});

/**
 * Get gallery image by ID
 * @route GET /api/gallery/:id
 * @access Private
 */
export const getGalleryImageById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const imageId = req.params.id;
    
    const imageDoc = await db.collection('gallery').doc(imageId).get();
    
    if (!imageDoc.exists) {
      return errorResponse(res, 404, 'Gallery image not found');
    }
    
    return successResponse(res, 200, 'Gallery image retrieved successfully', {
      id: imageDoc.id,
      ...imageDoc.data()
    });
  } catch (error: any) {
    logger.error('Error retrieving gallery image:', error);
    return errorResponse(res, 500, 'Error retrieving gallery image', error.message);
  }
});

/**
 * Create a new gallery image
 * @route POST /api/gallery
 * @access Private (Admin only)
 */
export const createGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { title, description, imageUrl, category } = req.body;
    
    if (!title || !imageUrl || !category) {
      return errorResponse(res, 400, 'Required fields missing: title, imageUrl, and category are required');
    }
    
    const newImage = {
      title,
      description: description || '',
      imageUrl,
      category,
      uploadedBy: req.user!.uid,
      uploadedAt: new Date().toISOString()
    };
    
    const imageRef = await db.collection('gallery').add(newImage);
    
    logger.info(`New gallery image created: ${imageRef.id}`);
    
    return successResponse(res, 201, 'Gallery image created successfully', {
      id: imageRef.id,
      ...newImage
    });
  } catch (error: any) {
    logger.error('Error creating gallery image:', error);
    return errorResponse(res, 500, 'Error creating gallery image', error.message);
  }
});

/**
 * Update a gallery image
 * @route PUT /api/gallery/:id
 * @access Private (Admin only)
 */
export const updateGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  try {
    const imageId = req.params.id;
    const { title, description, category } = req.body;
    
    const imageDoc = await db.collection('gallery').doc(imageId).get();
    
    if (!imageDoc.exists) {
      return errorResponse(res, 404, 'Gallery image not found');
    }
    
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    
    await db.collection('gallery').doc(imageId).update(updateData);
    
    logger.info(`Gallery image updated: ${imageId}`);
    
    return successResponse(res, 200, 'Gallery image updated successfully');
  } catch (error: any) {
    logger.error('Error updating gallery image:', error);
    return errorResponse(res, 500, 'Error updating gallery image', error.message);
  }
});

/**
 * Delete a gallery image
 * @route DELETE /api/gallery/:id
 * @access Private (Admin only)
 */
export const deleteGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  try {
    const imageId = req.params.id;
    
    const imageDoc = await db.collection('gallery').doc(imageId).get();
    
    if (!imageDoc.exists) {
      return errorResponse(res, 404, 'Gallery image not found');
    }
    
    await db.collection('gallery').doc(imageId).delete();
    
    logger.info(`Gallery image deleted: ${imageId}`);
    
    return successResponse(res, 200, 'Gallery image deleted successfully');
  } catch (error: any) {
    logger.error('Error deleting gallery image:', error);
    return errorResponse(res, 500, 'Error deleting gallery image', error.message);
  }
}); 