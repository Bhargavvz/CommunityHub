// Example serverless API endpoint for Vercel

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Initialize Firebase (you'll need to set these in Vercel environment variables)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // API routes handler
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const path = pathname.substring(4); // Remove the /api prefix
  
  try {
    // Handle API routes
    if (req.method === 'GET') {
      // Health check endpoint
      if (path === '/health') {
        return res.status(200).json({ status: 'OK', message: 'API is healthy' });
      }
      
      // Events endpoint
      if (path === '/events') {
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const events = [];
        eventsSnapshot.forEach(doc => {
          events.push({ id: doc.id, ...doc.data() });
        });
        return res.status(200).json({ events });
      }
      
      // Gallery endpoint
      if (path === '/gallery') {
        const gallerySnapshot = await getDocs(collection(db, 'gallery'));
        const images = [];
        gallerySnapshot.forEach(doc => {
          images.push({ id: doc.id, ...doc.data() });
        });
        return res.status(200).json({ images });
      }
      
      // Documents endpoint
      if (path === '/documents') {
        const documentsSnapshot = await getDocs(collection(db, 'documents'));
        const documents = [];
        documentsSnapshot.forEach(doc => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        return res.status(200).json({ documents });
      }
      
      // Add more routes as needed
    }
    
    if (req.method === 'POST') {
      // Add your POST routes here
    }
    
    // If no route matches
    return res.status(404).json({ error: 'Not found' });
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 
