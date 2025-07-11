
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
  // `date` will be the start date. For single day events, endDate will be the same.
  date: string;
  endDate?: string; 
  time: string;
  location: string;
  description: string;
  price: number;
  capacity: number;
  imageUrl: string;
  speakers?: Speaker[];
  activities?: Activity[];
  sponsors?: Sponsor[];
}

export interface Ticket {
  id: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  purchaseDate: string;
  checkedIn: boolean;
}

export type SubscriptionPlan = 'Free' | 'Starter' | 'Pro';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  subscriptionPlan: SubscriptionPlan;
}
