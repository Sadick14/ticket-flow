

export interface Speaker {
  name: string;
  title: string;
  imageUrl: string;
}

export interface Activity {
    name: string;
    time: string;
    description: string;
}

export interface Sponsor {
  name:string;
  logoUrl: string;
}

export interface Event {
  id: string;
  creatorId: string;
  name: string;
  status: 'active' | 'archived' | 'cancelled';
  organizationName?: string;
  organizationLogoUrl?: string;
  category: string;
  venueType: 'in-person' | 'online';
  location: string; // Physical address or "Online"
  onlineUrl?: string; // URL for online events
  // `date` will be the start date. For single day events, endDate will be the same.
  date: string;
  endDate?: string; 
  time: string;
  description: string;
  price: number;
  capacity: number;
  imageUrl: string;
  speakers?: Speaker[];
  activities?: Activity[];
  sponsors?: Sponsor[];
  collaboratorIds?: string[];
}

export interface Ticket {
  id: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  purchaseDate: string;
  checkedIn: boolean;
  price: number;
}

export type SubscriptionPlan = 'Free' | 'Starter' | 'Pro';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  subscriptionPlan: SubscriptionPlan;
  isAdmin?: boolean;
  status: 'active' | 'deactivated';
  lastSeen?: string; // ISO String
  subscriptionDueDate?: string; // ISO String for next payment
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  imageUrl: string;
  articleUrl: string;
  publishedDate: string; // ISO String
  description: string;
  gallery: { url: string }[];
}

export interface LaunchSubscriber {
    id: string;
    name: string;
    email: string;
    subscribedAt: string; // ISO String
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  submittedAt: string; // ISO string
  repliedAt?: string; // ISO string
  adminReply?: string;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    attachments?: string[]; // Array of data URIs
    timestamp?: any;
}
