import { Router, Request, Response } from 'express';
import { db } from '../config/firebase-admin';
import { successResponse, errorResponse } from '../utils/response-handler';
import { asyncHandler } from '../utils/error-handler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @route GET /api/test/firebase
 * @desc Test Firebase connection
 * @access Public
 */
router.get('/firebase', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Perform a simple query to test Firestore connection
    const testRef = db.collection('test');
    const timestamp = new Date().toISOString();
    
    await testRef.add({
      message: 'Firebase connection test',
      timestamp
    });
    
    logger.info('Firebase connection test successful');
    
    return successResponse(res, 200, 'Firebase connection successful', { timestamp });
  } catch (error: any) {
    logger.error('Firebase connection test failed:', error);
    return errorResponse(res, 500, 'Firebase connection failed', error.message);
  }
}));

export default router; 