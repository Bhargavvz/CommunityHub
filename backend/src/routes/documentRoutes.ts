import { Router } from 'express';
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
} from '../controllers/documentController';
import { verifyAuth, verifyAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/documents
 * @desc Get all documents with optional filtering
 * @access Private
 */
router.get('/', verifyAuth, getDocuments);

/**
 * @route GET /api/documents/:id
 * @desc Get document by ID
 * @access Private
 */
router.get('/:id', verifyAuth, getDocumentById);

/**
 * @route POST /api/documents
 * @desc Create a new document
 * @access Private (Admin)
 */
router.post('/', verifyAuth, verifyAdmin, createDocument);

/**
 * @route PUT /api/documents/:id
 * @desc Update a document
 * @access Private (Admin)
 */
router.put('/:id', verifyAuth, verifyAdmin, updateDocument);

/**
 * @route DELETE /api/documents/:id
 * @desc Delete a document
 * @access Private (Admin)
 */
router.delete('/:id', verifyAuth, verifyAdmin, deleteDocument);

export default router; 