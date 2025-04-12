import { Request, Response } from 'express';
import { auth, db } from '../config/firebase-admin';
import { logger } from '../utils/logger';
import { successResponse, errorResponse } from '../utils/response-handler';
import { asyncHandler } from '../utils/error-handler';

/**
 * Create a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password, displayName, phoneNumber } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      phoneNumber
    });

    // Store additional user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName: displayName || '',
      phoneNumber: phoneNumber || '',
      role: 'resident',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    logger.info(`New user registered: ${userRecord.uid}`);

    // In development mode, simulate a token for local testing
    const token = process.env.NODE_ENV === 'development' 
      ? `simulated_token_${Date.now()}`
      : null;

    return successResponse(res, 201, 'User registered successfully', {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      token
    });
  } catch (error: any) {
    logger.error('Error registering user:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return errorResponse(res, 400, 'Email already in use');
    }
    
    return errorResponse(res, 500, 'Error registering user', error.message);
  }
});

/**
 * Login a user with email and password
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    // Get user by email to check if they exist and get their role
    const userRecords = await auth.getUserByEmail(email)
      .catch(() => null);
    
    if (!userRecords) {
      return errorResponse(res, 404, 'User not found');
    }
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userRecords.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    
    if (!userData) {
      // User exists in Auth but not in Firestore, create the record
      await db.collection('users').doc(userRecords.uid).set({
        email: userRecords.email,
        displayName: userRecords.displayName || '',
        role: 'resident',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    logger.info(`User logged in: ${userRecords.uid}`);
    
    // In development mode, generate a simulated token
    const token = process.env.NODE_ENV === 'development' 
      ? `simulated_token_${Date.now()}`
      : null;

    return successResponse(res, 200, 'Login successful', {
      message: 'You should use Firebase Auth SDK for actual authentication',
      uid: userRecords.uid,
      token
    });
  } catch (error: any) {
    logger.error('Error during login:', error);
    return errorResponse(res, 500, 'Error during login', error.message);
  }
});

/**
 * Send a password reset email
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, 'Email is required');
    }

    // Check if user exists
    await auth.getUserByEmail(email);
    
    // Generate password reset link
    const resetLink = await auth.generatePasswordResetLink(email);
    
    // In a real application, you would send this link via email
    // For this demo, we'll just return it in the response
    logger.info(`Password reset requested for: ${email}`);
    
    return successResponse(res, 200, 'Password reset email sent', { 
      message: 'If an account exists with this email, a password reset link will be sent',
      // Only include the actual link in development mode
      ...(process.env.NODE_ENV === 'development' ? { resetLink } : {})
    });
  } catch (error: any) {
    // Don't reveal if email exists or not for security
    logger.error('Error requesting password reset:', error);
    
    // Return a success response even if the email doesn't exist
    // to prevent email enumeration attacks
    return successResponse(res, 200, 'Password reset email sent', { 
      message: 'If an account exists with this email, a password reset link will be sent',
      // In development, provide more info for debugging
      ...(process.env.NODE_ENV === 'development' ? { error: error.message } : {})
    });
  }
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { uid } = req.user!;
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return errorResponse(res, 404, 'User not found');
    }
    
    const userData = userDoc.data();
    
    return successResponse(res, 200, 'User profile retrieved successfully', {
      uid,
      ...userData
    });
  } catch (error: any) {
    logger.error('Error fetching current user:', error);
    return errorResponse(res, 500, 'Error fetching user data', error.message);
  }
});

/**
 * Update user profile
 * @route PUT /api/auth/me
 * @access Private
 */
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { uid } = req.user!;
    const { displayName, phoneNumber, address } = req.body;
    
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    
    if (displayName) updateData.displayName = displayName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (address) updateData.address = address;
    
    // Update user in Firebase Auth
    if (displayName || phoneNumber) {
      const authUpdateData: any = {};
      if (displayName) authUpdateData.displayName = displayName;
      if (phoneNumber) authUpdateData.phoneNumber = phoneNumber;
      
      await auth.updateUser(uid, authUpdateData);
    }
    
    // Update user in Firestore
    await db.collection('users').doc(uid).update(updateData);
    
    logger.info(`User profile updated: ${uid}`);
    
    return successResponse(res, 200, 'Profile updated successfully');
  } catch (error: any) {
    logger.error('Error updating user profile:', error);
    return errorResponse(res, 500, 'Error updating profile', error.message);
  }
});

/**
 * Change user password
 * @route POST /api/auth/change-password
 * @access Private
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { uid } = req.user!;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return errorResponse(res, 400, 'New password is required');
    }
    
    // Update password in Firebase Auth
    await auth.updateUser(uid, {
      password: newPassword
    });
    
    logger.info(`Password changed for user: ${uid}`);
    
    return successResponse(res, 200, 'Password changed successfully');
  } catch (error: any) {
    logger.error('Error changing password:', error);
    return errorResponse(res, 500, 'Error changing password', error.message);
  }
});

/**
 * Handle Google authentication
 * @route POST /api/auth/google-auth
 * @access Public
 */
export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    // Validate input
    if (!uid || !email) {
      return errorResponse(res, 400, 'User ID and email are required');
    }

    // Check if user exists in Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      // User doesn't exist in Firestore, create them
      await db.collection('users').doc(uid).set({
        email,
        displayName: displayName || '',
        photoURL: photoURL || '',
        role: 'resident',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      logger.info(`New Google user registered: ${uid}`);
    } else {
      // Update existing user's lastLogin
      await db.collection('users').doc(uid).update({
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      logger.info(`Google user logged in: ${uid}`);
    }
    
    // In development mode, simulate a token
    const token = process.env.NODE_ENV === 'development' 
      ? `simulated_token_${Date.now()}`
      : null;

    return successResponse(res, 200, 'Google authentication successful', {
      uid,
      email,
      displayName,
      token
    });
  } catch (error: any) {
    logger.error('Error during Google authentication:', error);
    return errorResponse(res, 500, 'Error during Google authentication', error.message);
  }
}); 