import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error';

// Load environment variables
dotenv.config();

// Initialize Firebase services
import './config/firebase-admin';
import './config/firebase';

// Import routes
import baseRoutes from './routes/baseRoutes';
import authRoutes from './routes/authRoutes';
import testRoutes from './routes/testRoutes';
import residentRoutes from './routes/residentRoutes';
import announcementRoutes from './routes/announcementRoutes';
import eventRoutes from './routes/eventRoutes';
import documentRoutes from './routes/documentRoutes';
import galleryRoutes from './routes/galleryRoutes';

// Create Express app
const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Base routes (no auth required)
app.use('/api', baseRoutes);

// Auth-protected routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/gallery', galleryRoutes);
// app.use('/api/maintenance', maintenanceRoutes);
// app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  logger.info(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`Health check available at: http://localhost:${port}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  // Exit process on critical errors
  // process.exit(1);
}); 