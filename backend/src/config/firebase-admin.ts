import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Check if all required environment variables are set
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

// Firebase admin variables
let app: admin.app.App;
let db: FirebaseFirestore.Firestore;
let auth: admin.auth.Auth;
let storage: admin.storage.Storage;

// Mock data for development
interface MockDataInterface {
  events: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    maxAttendees: number;
    attendees: string[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    [key: string]: any;
  }>;
  documents: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    uploadedBy: string;
    uploadedAt: string;
    [key: string]: any;
  }>;
  gallery: Array<{
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    category: string;
    uploadedBy: string;
    uploadedAt: string;
    [key: string]: any;
  }>;
  users: Array<{
    uid: string;
    email: string;
    displayName: string;
    role: string;
    admin: boolean;
    emailVerified: boolean;
    customToken: string;
  }>;
  [key: string]: any;
}

const mockData: MockDataInterface = {
  events: [
    {
      id: 'event1',
      title: 'Community BBQ',
      description: 'Join us for a community BBQ at the park.',
      date: new Date('2024-08-15T18:00:00Z').toISOString(),
      location: 'Community Park',
      maxAttendees: 50,
      attendees: [],
      createdBy: 'admin-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: true
    },
    {
      id: 'event2',
      title: 'Book Club Meeting',
      description: 'Monthly book club discussion.',
      date: new Date('2024-08-20T19:00:00Z').toISOString(),
      location: 'Community Center',
      maxAttendees: 20,
      attendees: [],
      createdBy: 'admin-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: true
    }
  ],
  documents: [
    {
      id: 'doc1',
      title: 'Community Guidelines',
      description: 'Official guidelines for the community.',
      category: 'Rules & Regulations',
      fileUrl: 'https://example.com/files/guidelines.pdf',
      fileName: 'guidelines.pdf',
      fileType: 'application/pdf',
      uploadedBy: 'admin-user',
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'doc2',
      title: 'Community Newsletter - Aug 2024',
      description: 'Monthly newsletter with community updates.',
      category: 'Newsletters',
      fileUrl: 'https://example.com/files/newsletter-aug.pdf',
      fileName: 'newsletter-aug.pdf',
      fileType: 'application/pdf',
      uploadedBy: 'admin-user',
      uploadedAt: new Date().toISOString()
    }
  ],
  gallery: [
    {
      id: 'img1',
      title: 'Summer Pool Party',
      description: 'Photos from our annual summer pool party.',
      imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1000',
      category: 'Community Events',
      uploadedBy: 'admin-user',
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'img2',
      title: 'Community Garden',
      description: 'Our beautiful community garden in bloom.',
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1000',
      category: 'Facilities',
      uploadedBy: 'admin-user',
      uploadedAt: new Date().toISOString()
    }
  ],
  users: [
    {
      uid: 'admin-user-id',
      email: 'admin@example.com',
      displayName: 'Admin User',
      role: 'admin',
      admin: true,
      emailVerified: true,
      customToken: 'admin-token'
    },
    {
      uid: 'resident-user-id',
      email: 'resident@example.com',
      displayName: 'Resident User',
      role: 'resident',
      admin: false,
      emailVerified: true,
      customToken: 'resident-token'
    }
  ]
};

// Helper function to create a document snapshot
const createDocSnapshot = (id: string, data: any) => {
  return {
    id,
    exists: !!data,
    data: () => data,
    ref: {
      path: `mock/${id}`
    }
  };
};

// Firestore db mock
const mockFirestore = {
  collection: (collectionName: string) => createCollectionMock(collectionName)
};

// Collection reference mock
const createCollectionMock = (collectionName: string) => {
  const collection = mockData[collectionName] || [];
  
  return {
    doc: (docId: string) => {
      const docData = collection.find((item: { id: string }) => item.id === docId) || null;
      
      return {
        id: docId,
        get: async () => createDocSnapshot(docId, docData),
        set: async (data: any) => {
          if (docData) {
            Object.assign(docData, data);
          } else {
            collection.push({ id: docId, ...data });
          }
        },
        update: async (data: any) => {
          if (docData) {
            Object.assign(docData, data);
          }
        },
        delete: async () => {
          const index = collection.findIndex((item: { id: string }) => item.id === docId);
          if (index !== -1) {
            collection.splice(index, 1);
          }
        }
      };
    },
    get: async () => {
      return {
        docs: collection.map((item: any) => createDocSnapshot(item.id, item)),
        empty: collection.length === 0,
        size: collection.length
      };
    },
    add: async (data: any) => {
      const id = `mock-${collectionName}-${Date.now()}`;
      const newDoc = { id, ...data };
      collection.push(newDoc);
      return {
        id,
        get: async () => createDocSnapshot(id, newDoc)
      };
    },
    where: (field: string, operator: string, value: any) => {
      let filteredCollection = [...collection];
      
      if (operator === '==') {
        filteredCollection = filteredCollection.filter((item: any) => item[field] === value);
      } else if (operator === '!=') {
        filteredCollection = filteredCollection.filter((item: any) => item[field] !== value);
      } else if (operator === '>') {
        filteredCollection = filteredCollection.filter((item: any) => item[field] > value);
      } else if (operator === '>=') {
        filteredCollection = filteredCollection.filter((item: any) => item[field] >= value);
      } else if (operator === '<') {
        filteredCollection = filteredCollection.filter((item: any) => item[field] < value);
      } else if (operator === '<=') {
        filteredCollection = filteredCollection.filter((item: any) => item[field] <= value);
      } else if (operator === 'array-contains') {
        filteredCollection = filteredCollection.filter((item: any) => 
          Array.isArray(item[field]) && item[field].includes(value)
        );
      }
      
      // Return a new mock collection with the filtered data
      return {
        ...createCollectionMock(collectionName),
        get: async () => {
          return {
            docs: filteredCollection.map((item: any) => createDocSnapshot(item.id, item)),
            empty: filteredCollection.length === 0,
            size: filteredCollection.length
          };
        }
      };
    },
    orderBy: (field: string, direction: string = 'asc') => {
      // Return a new mock collection with ordering capability
      return {
        ...createCollectionMock(collectionName),
        get: async () => {
          const sortedCollection = [...collection].sort((a: any, b: any) => {
            if (direction === 'asc') {
              return a[field] > b[field] ? 1 : -1;
            } else {
              return a[field] < b[field] ? 1 : -1;
            }
          });
          
          return {
            docs: sortedCollection.map((item: any) => createDocSnapshot(item.id, item)),
            empty: sortedCollection.length === 0,
            size: sortedCollection.length
          };
        }
      };
    },
    limit: (limitCount: number) => {
      // Return a new mock collection with limit capability
      return {
        ...createCollectionMock(collectionName),
        get: async () => {
          const limitedCollection = collection.slice(0, limitCount);
          return {
            docs: limitedCollection.map((item: any) => createDocSnapshot(item.id, item)),
            empty: limitedCollection.length === 0,
            size: limitedCollection.length
          };
        }
      };
    }
  };
};

// Function to create a mock/stub implementation when Firebase isn't available
const createMockFirebaseAdmin = () => {
  logger.warn('Using mock Firebase Admin implementation');
  
  // Mock Firestore
  const mockDb = mockFirestore as unknown as FirebaseFirestore.Firestore;
  
  // Mock Auth
  const mockAuth = {
    verifyIdToken: async (token: string) => {
      // Verify if token exists in mockUsers
      const user = mockData.users.find((u: any) => u.uid === token || u.customToken === token);
      
      if (!user) {
        throw new Error('Invalid token');
      }
      
      return {
        uid: user.uid,
        email: user.email,
        email_verified: user.emailVerified ?? true,
        admin: user.admin ?? false,
        custom_claims: {
          admin: user.admin ?? false
        }
      };
    },
    createCustomToken: async (uid: string) => {
      const customToken = `custom-token-${uid}-${Date.now()}`;
      const user = mockData.users.find((u: any) => u.uid === uid);
      
      if (user) {
        user.customToken = customToken;
      } else {
        mockData.users.push({
          uid,
          customToken,
          email: `user-${uid}@example.com`,
          displayName: `User ${uid}`,
          role: 'resident',
          admin: false,
          emailVerified: true
        });
      }
      
      return customToken;
    },
    getUser: async (uid: string) => {
      const user = mockData.users.find((u: any) => u.uid === uid);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified ?? true,
        customClaims: {
          admin: user.admin ?? false
        }
      };
    },
    getUserByEmail: async (email: string) => {
      const user = mockData.users.find((u: any) => u.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified ?? true,
        displayName: user.displayName,
        customClaims: {
          admin: user.admin ?? false
        }
      };
    },
    createUser: async (userData: { email: string, password: string, displayName?: string, phoneNumber?: string }) => {
      const { email, displayName, phoneNumber } = userData;
      
      // Check if user already exists
      const existingUser = mockData.users.find((u: any) => u.email === email);
      if (existingUser) {
        const error: any = new Error('Email already exists');
        error.code = 'auth/email-already-exists';
        throw error;
      }
      
      // Create new user
      const uid = `mock-user-${Date.now()}`;
      const newUser = {
        uid,
        email,
        displayName: displayName || '',
        phoneNumber: phoneNumber || '',
        role: 'resident',
        admin: false,
        emailVerified: false,
        customToken: `token-${uid}`
      };
      
      mockData.users.push(newUser);
      
      return {
        uid,
        email,
        displayName: displayName || '',
        phoneNumber: phoneNumber || '',
        emailVerified: false
      };
    },
    setCustomUserClaims: async (uid: string, claims: any) => {
      const user = mockData.users.find((u: any) => u.uid === uid);
      
      if (user) {
        user.admin = claims.admin ?? user.admin;
      }
      
      return;
    },
    generatePasswordResetLink: async (email: string) => {
      return `https://example.com/reset-password?email=${email}&token=mock-reset-token-${Date.now()}`;
    },
    updateUser: async (uid: string, userData: any) => {
      const user = mockData.users.find((u: any) => u.uid === uid);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      Object.assign(user, userData);
      
      return {
        ...user
      };
    }
  } as unknown as admin.auth.Auth;
  
  // Mock Storage
  const mockStorage = {} as unknown as admin.storage.Storage;
  
  return {
    mockDb,
    mockAuth,
    mockStorage,
    isAdmin: async (uid: string) => {
      try {
        const user = await mockAuth.getUser(uid);
        return user.customClaims?.admin === true;
      } catch (error) {
        return false;
      }
    }
  };
};

if (missingVars.length > 0 || !process.env.FIREBASE_PRIVATE_KEY) {
  logger.warn(`CRITICAL: Missing Firebase admin config or private key. USING MOCK FIREBASE ADMIN.`);
  const { mockDb, mockAuth, mockStorage } = createMockFirebaseAdmin();
  db = mockDb;
  auth = mockAuth;
  storage = mockStorage;
} else {
  // This block runs if required ENV vars are present AND service-account.json wasn't found OR failed.
  try {
    logger.info("Attempting to initialize REAL Firebase Admin SDK using credentials...");
    let credentials;

    const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      // Try the service account file path first
      try {
           credentials = admin.credential.cert(serviceAccountPath);
           logger.info('Using service account file credentials.');
      } catch (fileError) {
           logger.error('Error reading service account file, falling back to ENV vars:', fileError);
           // Clear credentials if file read failed, so it tries ENV vars next
           credentials = undefined; 
      }
    }
    
    // If file wasn't found or failed, try environment variables
    if (!credentials) {
      logger.info('Service account file not found or failed, attempting ENV variables.');
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const projectId = process.env.FIREBASE_PROJECT_ID;

      if (!privateKey || !clientEmail || !projectId) {
        logger.error('CRITICAL ERROR: Missing required Firebase Admin ENV variables (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY).');
        throw new Error('Missing Firebase Admin environment variables');
      }
      
      try {
          credentials = admin.credential.cert({
            projectId: projectId,
            clientEmail: clientEmail,
            privateKey: privateKey.replace(/\n/g, '\n') // Ensure newlines are correct here too
          });
          logger.info('Using environment variable credentials.');
      } catch (envError) {
           logger.error('Error parsing credentials from environment variables:', envError);
           throw envError; // Re-throw to trigger fallback
      }
    }

    // --- Initialize the App --- 
    if (credentials) {
       if (!admin.apps.length) {
         app = admin.initializeApp({
           credential: credentials,
           databaseURL: process.env.FIREBASE_DATABASE_URL,
           storageBucket: process.env.FIREBASE_STORAGE_BUCKET
         });
         db = admin.firestore();
         auth = admin.auth();
         storage = admin.storage();
         logger.info('SUCCESS: REAL Firebase Admin initialized.');
       } else {
         app = admin.app(); // Get existing app
         db = admin.firestore();
         auth = admin.auth();
         storage = admin.storage();
         logger.info('SUCCESS: REAL Firebase Admin already initialized.');
       }
    } else {
         // This should not be reached if the logic above is correct
         logger.error('CRITICAL ERROR: Failed to obtain credentials from file or ENV vars.');
         throw new Error('Could not determine Firebase credentials');
    }

  } catch (error) {
    // Catch errors from credential loading or initializeApp
    logger.error('CRITICAL ERROR during Firebase Admin setup:', error);
    logger.warn('FALLING BACK TO MOCK FIREBASE ADMIN due to setup error.');
    const { mockDb, mockAuth, mockStorage } = createMockFirebaseAdmin();
    db = mockDb;
    auth = mockAuth;
    storage = mockStorage;
  }
}

export { admin, app, db, auth, storage }; 