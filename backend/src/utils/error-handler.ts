import { Response } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standard error response format
 */
export const errorResponse = (
  res: Response,
  statusCode: number = 500,
  message: string = 'Server Error',
  errors: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Handle async errors in routes
 */
export const asyncHandler = (fn: Function) => (
  req: any,
  res: any,
  next: any
) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Error caught by asyncHandler:', error);
    
    if (error instanceof ApiError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    
    return errorResponse(res, 500, error.message || 'Server Error');
  });
}; 