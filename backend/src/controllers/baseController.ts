import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { successResponse, errorResponse } from '../utils/response-handler';
import { asyncHandler } from '../utils/error-handler';

/**
 * Get API information
 * @route GET /api
 * @access Public
 */
export const getApiInfo = asyncHandler(async (req: Request, res: Response) => {
  try {
    const apiInfo = {
      name: 'Residential Community Hub API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      time: new Date().toISOString(),
      firebase: {
        admin: process.env.FIREBASE_PROJECT_ID ? 'configured' : 'not configured',
        client: process.env.FIREBASE_API_KEY ? 'configured' : 'not configured'
      }
    };
    
    logger.info('API info requested');
    
    return successResponse(res, 200, 'API information', apiInfo);
  } catch (error: any) {
    logger.error('Error retrieving API info:', error);
    return errorResponse(res, 500, 'Error retrieving API information', error.message);
  }
});

/**
 * Get environment details
 * @route GET /api/env
 * @access Private (Admin only)
 */
export const getEnvInfo = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Only return non-sensitive info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 8000,
      corsOrigin: process.env.CORS_ORIGIN || '*',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'not set',
      uploadFolder: process.env.UPLOADS_FOLDER || 'uploads',
      maxFileSize: process.env.MAX_FILE_SIZE || '5MB'
    };
    
    logger.info('Environment info requested');
    
    return successResponse(res, 200, 'Environment information', envInfo);
  } catch (error: any) {
    logger.error('Error retrieving environment info:', error);
    return errorResponse(res, 500, 'Error retrieving environment information', error.message);
  }
}); 