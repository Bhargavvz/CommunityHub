import { 
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query as firestoreQuery, 
  where, 
  orderBy, 
  limit, 
  DocumentData, 
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { logger } from '../utils/logger';

/**
 * Firebase service for interacting with Firestore database
 */
class FirebaseService {
  /**
   * Get a document by ID from a specific collection
   * @param collectionName Collection name
   * @param id Document ID
   * @returns Document data or null if not found
   */
  async getById(collectionName: string, id: string): Promise<DocumentData | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        logger.info(`Document not found: ${collectionName}/${id}`);
        return null;
      }
    } catch (error) {
      logger.error(`Error getting document ${collectionName}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all documents from a specific collection
   * @param collectionName Collection name
   * @returns Array of documents
   */
  async getAll(collectionName: string): Promise<DocumentData[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error(`Error getting all documents from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new document in a specific collection
   * @param collectionName Collection name
   * @param data Document data
   * @param id Optional document ID (if not provided, Firestore will generate one)
   * @returns Created document ID
   */
  async create(collectionName: string, data: DocumentData, id?: string): Promise<string> {
    try {
      const timestamp = Timestamp.now();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      if (id) {
        const docRef = doc(db, collectionName, id);
        await setDoc(docRef, docData);
        return id;
      } else {
        const collectionRef = collection(db, collectionName);
        const newDocRef = doc(collectionRef);
        await setDoc(newDocRef, docData);
        return newDocRef.id;
      }
    } catch (error) {
      logger.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing document in a specific collection
   * @param collectionName Collection name
   * @param id Document ID
   * @param data Document data to update
   * @returns True if update was successful
   */
  async update(collectionName: string, id: string, data: DocumentData): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        logger.info(`Document not found for update: ${collectionName}/${id}`);
        return false;
      }

      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      
      return true;
    } catch (error) {
      logger.error(`Error updating document ${collectionName}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document from a specific collection
   * @param collectionName Collection name
   * @param id Document ID
   * @returns True if deletion was successful
   */
  async delete(collectionName: string, id: string): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        logger.info(`Document not found for deletion: ${collectionName}/${id}`);
        return false;
      }

      await deleteDoc(docRef);
      return true;
    } catch (error) {
      logger.error(`Error deleting document ${collectionName}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Query documents from a specific collection
   * @param collectionName Collection name
   * @param conditions Array of where conditions
   * @param orderByField Optional field to order by
   * @param orderDirection Optional order direction ('asc' or 'desc')
   * @param limitCount Optional limit of results
   * @returns Array of documents matching the query
   */
  async query(
    collectionName: string,
    conditions: { field: string; operator: string; value: any }[],
    orderByField?: string,
    orderDirection?: 'asc' | 'desc',
    limitCount?: number
  ): Promise<DocumentData[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const queryConstraints: QueryConstraint[] = [];
      
      // Add where conditions
      conditions.forEach(condition => {
        queryConstraints.push(where(condition.field, condition.operator as any, condition.value));
      });
      
      // Add orderBy if specified
      if (orderByField) {
        queryConstraints.push(orderBy(orderByField, orderDirection || 'asc'));
      }
      
      // Add limit if specified
      if (limitCount) {
        queryConstraints.push(limit(limitCount));
      }
      
      const q = firestoreQuery(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error(`Error querying documents from ${collectionName}:`, error);
      throw error;
    }
  }
}

export default new FirebaseService(); 