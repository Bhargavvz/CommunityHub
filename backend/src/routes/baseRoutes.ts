import { Router } from 'express';
import { getApiInfo, getEnvInfo } from '../controllers/baseController';
import { verifyAuth, verifyAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api
 * @desc Get API information
 * @access Public
 */
router.get('/', getApiInfo);

/**
 * @route GET /api/env
 * @desc Get environment details
 * @access Private (Admin only)
 */
router.get('/env', verifyAuth, verifyAdmin, getEnvInfo);

export default router; 