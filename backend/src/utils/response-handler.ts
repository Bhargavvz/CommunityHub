import { Response } from 'express';

/**
 * Standard success response format
 */
export const successResponse = (
  res: Response,
  statusCode: number = 200,
  message: string = 'Success',
  data: any = null
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Standard error response format
 */
export const errorResponse = (
  res: Response,
  statusCode: number = 500,
  message: string = 'Internal Server Error',
  error: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
  });
}; 