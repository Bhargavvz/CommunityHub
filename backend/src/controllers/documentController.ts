import { Request, Response } from 'express';
import { db } from '../config/firebase-admin';
import { logger } from '../utils/logger';
import { successResponse, errorResponse } from '../utils/response-handler';
import { asyncHandler } from '../utils/error-handler';

// Define Document interface
interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Get all documents with optional filtering
 * @route GET /api/documents
 * @access Private
 */
export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { category, limit = 100, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    // Get all documents
    const snapshot = await db.collection('documents').get();

    // Process documents with filtering
    let documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Document[];
    
    // Apply category filter if provided
    if (category) {
      documents = documents.filter(doc => doc.category === category);
    }
    
    // Sort by uploadedAt date, newest first
    documents.sort((a, b) => {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
    
    // Manual pagination
    const totalCount = documents.length;
    documents = documents.slice(offset, offset + Number(limit));
    
    return successResponse(res, 200, 'Documents retrieved successfully', {
      documents,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error: any) {
    logger.error('Error retrieving documents:', error);
    return errorResponse(res, 500, 'Error retrieving documents', error.message);
  }
});

/**
 * Get document by ID
 * @route GET /api/documents/:id
 * @access Private
 */
export const getDocumentById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const documentId = req.params.id;
    
    const documentDoc = await db.collection('documents').doc(documentId).get();
    
    if (!documentDoc.exists) {
      return errorResponse(res, 404, 'Document not found');
    }
    
    return successResponse(res, 200, 'Document retrieved successfully', {
      id: documentDoc.id,
      ...documentDoc.data()
    });
  } catch (error: any) {
    logger.error('Error retrieving document:', error);
    return errorResponse(res, 500, 'Error retrieving document', error.message);
  }
});

/**
 * Create a new document
 * @route POST /api/documents
 * @access Private (Admin only)
 */
export const createDocument = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { title, description, category, fileUrl, fileName, fileType } = req.body;
    
    if (!title || !category || !fileUrl || !fileName || !fileType) {
      return errorResponse(res, 400, 'Required fields missing: title, category, fileUrl, fileName, and fileType are required');
    }
    
    const newDocument = {
      title,
      description: description || '',
      category,
      fileUrl,
      fileName,
      fileType,
      uploadedBy: req.user!.uid,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const documentRef = await db.collection('documents').add(newDocument);
    
    logger.info(`New document created: ${documentRef.id}`);
    
    return successResponse(res, 201, 'Document created successfully', {
      id: documentRef.id,
      ...newDocument
    });
  } catch (error: any) {
    logger.error('Error creating document:', error);
    return errorResponse(res, 500, 'Error creating document', error.message);
  }
});

/**
 * Update a document
 * @route PUT /api/documents/:id
 * @access Private (Admin only)
 */
export const updateDocument = asyncHandler(async (req: Request, res: Response) => {
  try {
    const documentId = req.params.id;
    const { title, description, category } = req.body;
    
    const documentDoc = await db.collection('documents').doc(documentId).get();
    
    if (!documentDoc.exists) {
      return errorResponse(res, 404, 'Document not found');
    }
    
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    
    await db.collection('documents').doc(documentId).update(updateData);
    
    logger.info(`Document updated: ${documentId}`);
    
    return successResponse(res, 200, 'Document updated successfully');
  } catch (error: any) {
    logger.error('Error updating document:', error);
    return errorResponse(res, 500, 'Error updating document', error.message);
  }
});

/**
 * Delete a document
 * @route DELETE /api/documents/:id
 * @access Private (Admin only)
 */
export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  try {
    const documentId = req.params.id;
    
    const documentDoc = await db.collection('documents').doc(documentId).get();
    
    if (!documentDoc.exists) {
      return errorResponse(res, 404, 'Document not found');
    }
    
    await db.collection('documents').doc(documentId).delete();
    
    logger.info(`Document deleted: ${documentId}`);
    
    return successResponse(res, 200, 'Document deleted successfully');
  } catch (error: any) {
    logger.error('Error deleting document:', error);
    return errorResponse(res, 500, 'Error deleting document', error.message);
  }
}); 