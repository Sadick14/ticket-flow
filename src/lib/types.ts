
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
