import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Server configuration
export const SERVER_CONFIG = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  uploadsFolder: process.env.UPLOADS_FOLDER || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB in bytes
};

// Routes base paths
export const ROUTES = {
  api: '/api',
  auth: '/api/auth',
  users: '/api/users',
  documents: '/api/documents',
  events: '/api/events',
  announcements: '/api/announcements',
  gallery: '/api/gallery',
  residents: '/api/residents',
}; 