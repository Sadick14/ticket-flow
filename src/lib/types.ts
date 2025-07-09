
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

export interface Event {
  id: string;
  creatorId: string;
  name: string;
  category: string;
  date: string;
  time: string;
  location: string;
  description: string;
  price: number;
  capacity: number;
  imageUrl: string;
  speakers?: Speaker[];
  activities?: Activity[];
}

export interface Ticket {
  id: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  purchaseDate: string;
}

export type SubscriptionPlan = 'Free' | 'Starter' | 'Pro';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  subscriptionPlan: SubscriptionPlan;
}
