// User/Resident interface
export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  unit?: string;
  role: 'resident' | 'admin' | 'super_admin' | 'security';
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
  moveInDate?: Date;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  privacySettings?: {
    showEmail: boolean;
    showPhone: boolean;
    showInDirectory: boolean;
  };
}

// Document interface
export interface IDocument {
  id: string;
  name: string;
  category: string;
  fileUrl: string;
  uploadedBy: string;
  size: number;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  tags?: string[];
  isPublic: boolean;
}

// Event interface
export interface IEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  location: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  attendees?: string[];
  maxAttendees?: number;
  image?: string;
  isPublic: boolean;
}

// Announcement interface
export interface IAnnouncement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'emergency' | 'maintenance' | 'events' | 'security';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  attachments?: string[];
  isPublic: boolean;
}

// Gallery Image interface
export interface IGalleryImage {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
  size: number;
  width: number;
  height: number;
  album?: string;
  tags?: string[];
}

// Maintenance Request interface
export interface IMaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  createdBy: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  location: string;
  images?: string[];
  comments?: {
    id: string;
    text: string;
    createdBy: string;
    createdAt: Date;
  }[];
} 