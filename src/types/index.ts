export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  rsvpCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  unit: string;
  role: 'resident' | 'admin';
  avatar?: string;
}