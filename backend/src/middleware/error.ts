import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { errorResponse } from '../utils/response-handler';

/**
 * Custom error middleware to handle all errors
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Determine if error is from Firebase
  if (err.code && err.code.startsWith('auth/')) {
    return errorResponse(res, 401, `Authentication error: ${err.message}`, err.code);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(res, 400, 'Validation Error', err.message);
  }

  // Handle duplicate key errors from DB
  if (err.code === 11000) {
    return errorResponse(res, 400, 'Duplicate Field Value', err.message);
  }

  // Generic server error
  return errorResponse(
    res,
    err.statusCode || 500,
    err.message || 'Server Error',
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
}; 