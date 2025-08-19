
export type SubscriptionPlan = 'Free' | 'Essential' | 'Pro' | 'Custom';

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  followerIds?: string[];
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  }
}

export interface Speaker {
  name: string;
  title: string;
  imageUrl: string;
}

export interface Activity {
    name: string;
    date?: string; // Optional date for multi-day events
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

export interface TicketType {
  id: string;
  name: string;
  price: number;
  capacity?: number;
}

export interface Event {
  id: string;
  organizationId: string;
  creatorId: string; // Keep for legacy/ownership checks, but org is primary
  name: string;
  status: 'active' | 'archived' | 'cancelled';
  category: string;
  venueType: 'in-person' | 'online';
  location: string; // Physical address or "Online"
  latitude?: number;
  longitude?: number;
  onlineUrl?: string; // URL for online events
  date: string; // Start date
  endDate?: string; // For multi-day events
  time: string;
  description: string;
  price: number; // Default price, used if no ticket types
  capacity: number;
  imageUrl: string;
  speakers?: Speaker[];
  activities?: Activity[];
  sponsors?: Sponsor[];
  promoCodes?: PromoCode[];
  collaboratorIds?: string[]; // Legacy, consider removing in favor of organization members
  ticketTypes?: TicketType[];
  // Denormalized organization data for easier access
  organizationName?: string;
  organizationLogoUrl?: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  organizationId: string;
  attendeeName: string;
  attendeeEmail: string;
  purchaseDate: string;
  checkedIn: boolean;
  price: number;
  ticketTypeName?: string;
  status: 'pending' | 'confirmed';
  bookingCode: string;
  // This is added client-side after fetching
  event?: Event;
  payoutId?: string;
  paymentSplit?: any;
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
  followingOrganizationIds?: string[];
}

export interface NewsArticle {
  id: string;
  organizationId?: string; // To link news to an organization
  title: string;
  source: string; // Could be organization name or external source
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

export type LogLevel = 'info' | 'activity' | 'warning' | 'error' | 'fatal';

export interface AppLog {
  id: string;
  timestamp: string; // ISO string
  level: LogLevel;
  message: string;
  category: string; // e.g., 'auth', 'billing', 'event', 'ui-crash'
  userId?: string;
  userEmail?: string;
  details?: Record<string, any>;
}
