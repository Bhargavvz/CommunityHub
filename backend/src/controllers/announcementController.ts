import { Request, Response } from 'express';
import { db } from '../config/firebase-admin';
import { logger } from '../utils/logger';
import { successResponse, errorResponse } from '../utils/response-handler';
import { asyncHandler } from '../utils/error-handler';

/**
 * Get all announcements with optional filtering
 * @route GET /api/announcements
 * @access Private
 */
export const getAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { category, limit = 10, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = db.collection('announcements')
      .orderBy('createdAt', 'desc');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    const snapshot = await query.limit(Number(limit)).offset(offset).get();
    
    const announcements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get total count for pagination
    const countSnapshot = await db.collection('announcements').count().get();
    const totalCount = countSnapshot.data().count;
    
    return successResponse(res, 200, 'Announcements retrieved successfully', {
      announcements,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error: any) {
    logger.error('Error retrieving announcements:', error);
    return errorResponse(res, 500, 'Error retrieving announcements', error.message);
  }
});

/**
 * Get announcement by ID
 * @route GET /api/announcements/:id
 * @access Private
 */
export const getAnnouncementById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const announcementId = req.params.id;
    
    const announcementDoc = await db.collection('announcements').doc(announcementId).get();
    
    if (!announcementDoc.exists) {
      return errorResponse(res, 404, 'Announcement not found');
    }
    
    return successResponse(res, 200, 'Announcement retrieved successfully', {
      id: announcementDoc.id,
      ...announcementDoc.data()
    });
  } catch (error: any) {
    logger.error('Error retrieving announcement:', error);
    return errorResponse(res, 500, 'Error retrieving announcement', error.message);
  }
});

/**
 * Create a new announcement
 * @route POST /api/announcements
 * @access Private (Admin only)
 */
export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { title, content, category, priority = 'normal', expireAt } = req.body;
    
    if (!title || !content || !category) {
      return errorResponse(res, 400, 'Title, content, and category are required');
    }
    
    const newAnnouncement = {
      title,
      content,
      category,
      priority,
      expireAt: expireAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: req.user!.uid,
        name: req.user!.email
      },
      status: 'active'
    };
    
    const announcementRef = await db.collection('announcements').add(newAnnouncement);
    
    logger.info(`New announcement created: ${announcementRef.id}`);
    
    return successResponse(res, 201, 'Announcement created successfully', {
      id: announcementRef.id,
      ...newAnnouncement
    });
  } catch (error: any) {
    logger.error('Error creating announcement:', error);
    return errorResponse(res, 500, 'Error creating announcement', error.message);
  }
});

/**
 * Update an announcement
 * @route PUT /api/announcements/:id
 * @access Private (Admin only)
 */
export const updateAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  try {
    const announcementId = req.params.id;
    const { title, content, category, priority, expireAt, status } = req.body;
    
    const announcementDoc = await db.collection('announcements').doc(announcementId).get();
    
    if (!announcementDoc.exists) {
      return errorResponse(res, 404, 'Announcement not found');
    }
    
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (priority) updateData.priority = priority;
    if (expireAt) updateData.expireAt = expireAt;
    if (status) updateData.status = status;
    
    await db.collection('announcements').doc(announcementId).update(updateData);
    
    logger.info(`Announcement updated: ${announcementId}`);
    
    return successResponse(res, 200, 'Announcement updated successfully');
  } catch (error: any) {
    logger.error('Error updating announcement:', error);
    return errorResponse(res, 500, 'Error updating announcement', error.message);
  }
});

/**
 * Delete an announcement
 * @route DELETE /api/announcements/:id
 * @access Private (Admin only)
 */
export const deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  try {
    const announcementId = req.params.id;
    
    const announcementDoc = await db.collection('announcements').doc(announcementId).get();
    
    if (!announcementDoc.exists) {
      return errorResponse(res, 404, 'Announcement not found');
    }
    
    await db.collection('announcements').doc(announcementId).delete();
    
    logger.info(`Announcement deleted: ${announcementId}`);
    
    return successResponse(res, 200, 'Announcement deleted successfully');
  } catch (error: any) {
    logger.error('Error deleting announcement:', error);
    return errorResponse(res, 500, 'Error deleting announcement', error.message);
  }
}); 