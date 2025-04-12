import { Request, Response } from 'express';
import { db } from '../config/firebase-admin';
import { logger } from '../utils/logger';
import { successResponse, errorResponse } from '../utils/response-handler';
import { asyncHandler } from '../utils/error-handler';

/**
 * Get all residents
 * @route GET /api/residents
 * @access Private (Admin only)
 */
export const getAllResidents = asyncHandler(async (req: Request, res: Response) => {
  try {
    const residentsSnapshot = await db.collection('users')
      .where('role', '==', 'resident')
      .get();
    
    const residents = residentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return successResponse(res, 200, 'Residents retrieved successfully', residents);
  } catch (error: any) {
    logger.error('Error retrieving residents:', error);
    return errorResponse(res, 500, 'Error retrieving residents', error.message);
  }
});

/**
 * Get resident by ID
 * @route GET /api/residents/:id
 * @access Private (Admin and resident themselves)
 */
export const getResidentById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const residentId = req.params.id;
    
    // Check if user is admin or the resident themselves
    if (req.user!.role !== 'admin' && req.user!.uid !== residentId) {
      return errorResponse(res, 403, 'Not authorized to access this resident profile');
    }
    
    const residentDoc = await db.collection('users').doc(residentId).get();
    
    if (!residentDoc.exists) {
      return errorResponse(res, 404, 'Resident not found');
    }
    
    return successResponse(res, 200, 'Resident retrieved successfully', {
      id: residentDoc.id,
      ...residentDoc.data()
    });
  } catch (error: any) {
    logger.error('Error retrieving resident:', error);
    return errorResponse(res, 500, 'Error retrieving resident', error.message);
  }
});

/**
 * Create a new resident (Admin only)
 * @route POST /api/residents
 * @access Private (Admin only)
 */
export const createResident = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, name, phoneNumber, flatNumber, blockNumber } = req.body;
    
    if (!email || !name || !flatNumber) {
      return errorResponse(res, 400, 'Email, name, and flat number are required');
    }
    
    // Check if resident with same email exists
    const existingResident = await db.collection('users')
      .where('email', '==', email)
      .get();
    
    if (!existingResident.empty) {
      return errorResponse(res, 400, 'Resident with this email already exists');
    }
    
    // Create new resident
    const newResident = {
      email,
      displayName: name,
      phoneNumber: phoneNumber || '',
      flatNumber,
      blockNumber: blockNumber || '',
      role: 'resident',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user!.uid
    };
    
    const residentRef = await db.collection('users').add(newResident);
    
    logger.info(`New resident created: ${residentRef.id}`);
    
    return successResponse(res, 201, 'Resident created successfully', {
      id: residentRef.id,
      ...newResident
    });
  } catch (error: any) {
    logger.error('Error creating resident:', error);
    return errorResponse(res, 500, 'Error creating resident', error.message);
  }
});

/**
 * Update a resident
 * @route PUT /api/residents/:id
 * @access Private (Admin and resident themselves)
 */
export const updateResident = asyncHandler(async (req: Request, res: Response) => {
  try {
    const residentId = req.params.id;
    const { name, phoneNumber, flatNumber, blockNumber } = req.body;
    
    // Check if user is admin or the resident themselves
    if (req.user!.role !== 'admin' && req.user!.uid !== residentId) {
      return errorResponse(res, 403, 'Not authorized to update this resident profile');
    }
    
    const residentDoc = await db.collection('users').doc(residentId).get();
    
    if (!residentDoc.exists) {
      return errorResponse(res, 404, 'Resident not found');
    }
    
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    
    if (name) updateData.displayName = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    
    // Only admin can update flat and block number
    if (req.user!.role === 'admin') {
      if (flatNumber) updateData.flatNumber = flatNumber;
      if (blockNumber) updateData.blockNumber = blockNumber;
    }
    
    await db.collection('users').doc(residentId).update(updateData);
    
    logger.info(`Resident updated: ${residentId}`);
    
    return successResponse(res, 200, 'Resident updated successfully');
  } catch (error: any) {
    logger.error('Error updating resident:', error);
    return errorResponse(res, 500, 'Error updating resident', error.message);
  }
});

/**
 * Delete a resident
 * @route DELETE /api/residents/:id
 * @access Private (Admin only)
 */
export const deleteResident = asyncHandler(async (req: Request, res: Response) => {
  try {
    const residentId = req.params.id;
    
    const residentDoc = await db.collection('users').doc(residentId).get();
    
    if (!residentDoc.exists) {
      return errorResponse(res, 404, 'Resident not found');
    }
    
    await db.collection('users').doc(residentId).delete();
    
    logger.info(`Resident deleted: ${residentId}`);
    
    return successResponse(res, 200, 'Resident deleted successfully');
  } catch (error: any) {
    logger.error('Error deleting resident:', error);
    return errorResponse(res, 500, 'Error deleting resident', error.message);
  }
}); 