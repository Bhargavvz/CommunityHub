import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase-admin';
import { logger } from '../utils/logger';

// Extend the Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        role?: string;
      };
    }
  }
}

/**
 * Middleware to verify Firebase authentication token
 */
export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Check if token is a simulated token in development mode
      if (process.env.NODE_ENV === 'development' && token.startsWith('simulated_token_')) {
        // For development, we'll use a mock user
        req.user = {
          uid: 'dev-user-123',
          email: 'dev@example.com',
          role: 'admin'
        };
        
        logger.info(`Development mode: Using mock user ${req.user.uid}`);
        return next();
      }
      
      // Verify token with Firebase Auth
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user'
      };
      
      logger.info(`User ${req.user.uid} authenticated successfully`);
      return next();
    } catch (error) {
      logger.error('Invalid token provided:', error);
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
  } catch (error) {
    logger.error('Error in auth middleware:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during authentication.' 
    });
  }
};

/**
 * Middleware to verify if user has admin role
 */
export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. Authentication required.' 
    });
  }
  
  if (req.user.role !== 'admin') {
    logger.warn(`User ${req.user.uid} attempted to access admin-only resource`);
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  
  return next();
}; 