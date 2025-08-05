

export type SubscriptionPlan = 'Free' | 'Essential' | 'Pro' | 'Custom';

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

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
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
  latitude?: number;
  longitude?: number;
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
  promoCodes?: PromoCode[];
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
  status: 'pending' | 'confirmed';
  bookingCode: string;
  // This is added client-side after fetching
  event?: Event;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
  status: 'active' | 'deactivated';
  subscriptionPlan: SubscriptionPlan;
  lastSeen?: string; // ISO String
  enrolledCourseIds?: string[];
  paymentProfileCompleted?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  imageUrl: string;
  articleUrl: string;
  publishedDate: string; // ISO String
  description: string;
  category: string;
  status: 'published' | 'draft';
  gallery: { url: string }[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Page {
  content: string; // Markdown content for one page of a lesson
  imageUrl?: string; // A unique illustration for this page
}

export interface Lesson {
  id: string;
  title: string;
  duration: string; // e.g., "15 mins"
  videoUrl: string;
  pages: Page[]; // A lesson can have multiple pages
  quiz: QuizQuestion[];
}

export interface Project {
    title: string;
    description: string; // Markdown
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  imageUrl: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  price: number; // in cents
  status: 'published' | 'draft';
  isFeatured?: boolean;
  isPopular?: boolean;
  isTrending?: boolean;
  project: Project;
  lessons: Lesson[];
}


export interface FeaturedArticle {
  id: string; // Usually a singleton doc, e.g., 'current'
  title: string;
  content: string; // Markdown content
  imageUrl: string;
  updatedAt: any; // Firestore ServerTimestamp
}

export interface LaunchSubscriber {
    id: string;
    name: string;
    email: string;
    subscribedAt: any; // Can be a server timestamp or an ISO string
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

export interface SubscriptionRequest {
    id:string;
    userId: string;
    plan: SubscriptionPlan;
    price: number;
    bookingCode: string;
    status: 'pending' | 'approved';
    requestedAt: string; // ISO string
    approvedAt?: string; // ISO string
}

export interface CourseEnrollmentRequest {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  price: number;
  bookingCode: string;
  status: 'pending' | 'approved';
  requestedAt: string; // ISO string
}
