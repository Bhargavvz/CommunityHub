import { Router } from 'express';
import { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  getCurrentUser, 
  updateUserProfile,
  changePassword,
  googleAuth
} from '../controllers/authController';
import { verifyAuth } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', registerUser);

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post('/login', loginUser);

/**
 * @route POST /api/auth/google-auth
 * @desc Register or login with Google
 * @access Public
 */
router.post('/google-auth', googleAuth);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', verifyAuth, getCurrentUser);

/**
 * @route PUT /api/auth/me
 * @desc Update user profile
 * @access Private
 */
router.put('/me', verifyAuth, updateUserProfile);

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', verifyAuth, changePassword);

export default router; 