import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Event types
export interface Event {
  id?: string;
  title: string;
  description: string;
  date: Date | string;
  location: string;
  organizer: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: Date | string;
}

// Document types
export interface Document {
  id?: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date | string;
}

// Gallery types
export interface GalleryImage {
  id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  uploadedBy: string;
  uploadedAt: Date | string;
}

// Events Service
export const eventsService = {
  // Get all events
  getEvents: async (): Promise<Event[]> => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
    } catch (error) {
      console.error('Error getting events:', error);
      throw error;
    }
  },
  
  // Get upcoming events
  getUpcomingEvents: async (): Promise<Event[]> => {
    try {
      const eventsRef = collection(db, 'events');
      const today = new Date();
      
      // We would ideally use where with date comparison but Firestore requires an index
      // So we'll retrieve all and filter on client side
      const q = query(eventsRef, orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as Event)
        .filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today;
        });
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw error;
    }
  },
  
  // Add a new event
  addEvent: async (event: Omit<Event, 'id'>): Promise<string> => {
    try {
      const eventsRef = collection(db, 'events');
      const docRef = await addDoc(eventsRef, {
        ...event,
        createdAt: new Date().toISOString() // Ensure createdAt is set even if not provided
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  },
  
  // Update an existing event
  updateEvent: async (id: string, event: Partial<Event>): Promise<void> => {
    try {
      const eventRef = doc(db, 'events', id);
      await updateDoc(eventRef, { 
        ...event,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },
  
  // Delete an event
  deleteEvent: async (id: string): Promise<void> => {
    try {
      const eventRef = doc(db, 'events', id);
      await deleteDoc(eventRef);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },
};

// Documents Service
export const documentsService = {
  // Get all documents
  getDocuments: async (): Promise<Document[]> => {
    try {
      const docsRef = collection(db, 'documents');
      const q = query(docsRef, orderBy('uploadedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },
  
  // Get documents by category
  getDocumentsByCategory: async (category: string): Promise<Document[]> => {
    try {
      const docsRef = collection(db, 'documents');
      const q = query(
        docsRef, 
        where('category', '==', category),
        orderBy('uploadedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
    } catch (error) {
      console.error(`Error getting documents for category ${category}:`, error);
      throw error;
    }
  },
  
  // Add a new document
  addDocument: async (document: Omit<Document, 'id'>): Promise<string> => {
    try {
      const docsRef = collection(db, 'documents');
      const docRef = await addDoc(docsRef, {
        ...document,
        uploadedAt: new Date().toISOString() // Ensure uploadedAt is set even if not provided
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },
  
  // Delete a document
  deleteDocument: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, 'documents', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
};

// Gallery Service
export const galleryService = {
  // Get all gallery images
  getGalleryImages: async (): Promise<GalleryImage[]> => {
    try {
      const imagesRef = collection(db, 'gallery');
      const q = query(imagesRef, orderBy('uploadedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryImage[];
    } catch (error) {
      console.error('Error getting gallery images:', error);
      throw error;
    }
  },
  
  // Get gallery images by category
  getGalleryImagesByCategory: async (category: string): Promise<GalleryImage[]> => {
    try {
      const imagesRef = collection(db, 'gallery');
      const q = query(
        imagesRef, 
        where('category', '==', category),
        orderBy('uploadedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryImage[];
    } catch (error) {
      console.error(`Error getting gallery images for category ${category}:`, error);
      throw error;
    }
  },
  
  // Add a new gallery image
  addGalleryImage: async (image: Omit<GalleryImage, 'id'>): Promise<string> => {
    try {
      const imagesRef = collection(db, 'gallery');
      const docRef = await addDoc(imagesRef, {
        ...image,
        uploadedAt: new Date().toISOString() // Ensure uploadedAt is set even if not provided
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding gallery image:', error);
      throw error;
    }
  },
  
  // Delete a gallery image
  deleteGalleryImage: async (id: string): Promise<void> => {
    try {
      const imageRef = doc(db, 'gallery', id);
      await deleteDoc(imageRef);
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      throw error;
    }
  },
}; 