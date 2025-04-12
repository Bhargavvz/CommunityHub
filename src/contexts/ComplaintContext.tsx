import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

// Complaint type definition
export interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
}

// Type for submitting a new complaint
export type ComplaintSubmission = Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'assignedTo' | 'resolution'>;

// Context interface
interface ComplaintContextType {
  complaints: Complaint[];
  userComplaints: Complaint[];
  isLoading: boolean;
  submitComplaint: (data: ComplaintSubmission) => Promise<Complaint>;
  getUserComplaints: (userId: string) => Complaint[];
  getComplaintById: (id: string) => Complaint | undefined;
  updateComplaintStatus: (id: string, status: Complaint['status'], resolution?: string) => Promise<Complaint>;
}

// Create context
const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

// Simulated API functions - in a real app, these would be actual API calls
const simulateApiCall = <T,>(data: T, delay = 1000): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

// Sample complaints for demo purposes
const sampleComplaints: Complaint[] = [
  {
    id: '1',
    title: 'Water Leakage in Bathroom',
    category: 'Maintenance',
    description: 'There is water leaking from the ceiling in the bathroom. Seems to be coming from the apartment above.',
    status: 'in-progress',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Maintenance Team',
  },
  {
    id: '2',
    title: 'Noise from Neighboring Apartment',
    category: 'Noise',
    description: 'The residents in apartment 203 have been playing loud music late at night for the past week.',
    status: 'pending',
    userId: 'user2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Parking Issue',
    category: 'Parking',
    description: 'Someone has been parking in my assigned spot #42 repeatedly over the last month.',
    status: 'resolved',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    resolution: 'Security has identified the vehicle owner and addressed the issue. Monitoring will continue.',
  }
];

// Provider component
export const ComplaintProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(sampleComplaints);
  const [isLoading, setIsLoading] = useState(false);

  const getUserComplaints = (userId: string): Complaint[] => {
    return complaints.filter(complaint => complaint.userId === userId);
  };

  const getComplaintById = (id: string): Complaint | undefined => {
    return complaints.find(complaint => complaint.id === id);
  };

  const submitComplaint = async (data: ComplaintSubmission): Promise<Complaint> => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      const newComplaint: Complaint = {
        ...data,
        id: uuidv4(),
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      // In a real app, this would be an API call to save to a database
      await simulateApiCall(newComplaint, 1500);
      
      // Add to local state
      setComplaints(prev => [...prev, newComplaint]);
      toast.success('Complaint submitted successfully');
      return newComplaint;
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Failed to submit complaint');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateComplaintStatus = async (
    id: string, 
    status: Complaint['status'], 
    resolution?: string
  ): Promise<Complaint> => {
    setIsLoading(true);
    try {
      const complaint = getComplaintById(id);
      if (!complaint) {
        throw new Error('Complaint not found');
      }

      const updatedComplaint: Complaint = {
        ...complaint,
        status,
        resolution: resolution || complaint.resolution,
        updatedAt: new Date().toISOString(),
      };

      // In a real app, this would be an API call
      await simulateApiCall(updatedComplaint, 1000);
      
      // Update local state
      setComplaints(prev => 
        prev.map(c => c.id === id ? updatedComplaint : c)
      );

      toast.success(`Complaint status updated to ${status}`);
      return updatedComplaint;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update complaint status');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        userComplaints: getUserComplaints('user1'), // Default to user1 for demo purposes
        isLoading,
        submitComplaint,
        getUserComplaints,
        getComplaintById,
        updateComplaintStatus,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

// Custom hook
export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
}; 