
import type { Event, Ticket, UserProfile, NewsArticle, LaunchSubscriber, ContactSubmission } from './types';

export const initialUsers: UserProfile[] = [
  {
    uid: 'user-001',
    email: 'sadick@example.com',
    displayName: 'Sadick',
    photoURL: 'https://placehold.co/100x100.png',
    isAdmin: true,
    status: 'active',
    subscriptionPlan: 'Pro',
    lastSeen: new Date().toISOString(),
  },
  {
    uid: 'user-002',
    email: 'mike@example.com',
    displayName: 'Mike Chen',
    photoURL: 'https://placehold.co/100x100.png',
    isAdmin: false,
    status: 'active',
    subscriptionPlan: 'Essential',
    lastSeen: new Date().toISOString(),
  },
   {
    uid: 'user-003',
    email: 'lisa@example.com',
    displayName: 'Lisa Rodriguez',
    photoURL: 'https://placehold.co/100x100.png',
    isAdmin: false,
    status: 'active',
    subscriptionPlan: 'Free',
    lastSeen: new Date().toISOString(),
  }
];


export const initialEvents: Event[] = [
  {
    id: 'event-001',
    creatorId: 'user-001',
    name: "Innovate & Inspire: A Tech Summit",
    status: 'active',
    organizationName: "Tech Visionaries",
    category: "Professional",
    venueType: "in-person",
    location: "Accra International Conference Centre",
    date: "2025-09-20",
    time: "09:00",
    description: "Join industry leaders for a day of insightful talks on AI, blockchain, and the future of technology.",
    price: 150,
    capacity: 500,
    imageUrl: "https://placehold.co/600x400.png",
    "data-ai-hint": "conference technology",
    speakers: [{name: 'Dr. Evelyn Reed', title: 'AI Ethicist', imageUrl: 'https://placehold.co/100x100.png'}],
  },
  {
    id: 'event-002',
    creatorId: 'user-002',
    name: "Accra Food Festival",
    status: 'active',
    organizationName: "Taste of Ghana",
    category: "Food & Drinks",
    venueType: "in-person",
    location: "Independence Square, Accra",
    date: "2025-10-05",
    time: "11:00",
    description: "A vibrant celebration of Ghanaian and international cuisine. Enjoy live music, cooking demos, and delicious food.",
    price: 25,
    capacity: 2000,
    imageUrl: "https://placehold.co/600x400.png",
    "data-ai-hint": "food festival"
  },
   {
    id: 'event-003',
    creatorId: 'user-001',
    name: "AfroFuture Fest",
    status: 'active',
    organizationName: "Vibes Creative",
    category: "Nightlife & Parties",
    venueType: "in-person",
    location: "Labadi Beach, Accra",
    date: "2025-12-28",
    time: "16:00",
    description: "The biggest year-end party in West Africa. Experience top DJs, live performances, and unforgettable vibes by the ocean.",
    price: 200,
    capacity: 10000,
    imageUrl: "https://placehold.co/600x400.png",
     "data-ai-hint": "music festival"
  },
  {
    id: 'event-004',
    creatorId: 'user-003',
    name: "Beginner's Guide to Digital Marketing",
    status: 'active',
    organizationName: "Marketing Mavens",
    category: "Professional",
    venueType: "online",
    location: "Online",
    onlineUrl: "https://zoom.us/j/1234567890",
    date: "2025-08-15",
    time: "14:00",
    description: "Learn the fundamentals of digital marketing in this comprehensive online workshop. Perfect for entrepreneurs and students.",
    price: 0,
    capacity: 300,
    imageUrl: "https://placehold.co/600x400.png",
    "data-ai-hint": "online workshop"
  }
];

export const initialNews: NewsArticle[] = [
    {
        id: "news-001",
        title: "The Rise of Hybrid Events: Combining Virtual and In-Person Experiences",
        source: "Event Industry News",
        imageUrl: "https://placehold.co/600x400.png",
        "data-ai-hint": "hybrid event",
        articleUrl: "https://example.com/news1",
        publishedDate: "2025-06-15T10:00:00Z",
        description: "Explore how event organizers are successfully blending physical and digital worlds to create more accessible and engaging experiences for a global audience.",
        gallery: []
    },
    {
        id: "news-002",
        title: "Sustainability in Events: How to Host an Eco-Friendly Gathering",
        source: "Green Events Hub",
        imageUrl: "https://placehold.co/600x400.png",
         "data-ai-hint": "eco friendly",
        articleUrl: "https://example.com/news2",
        publishedDate: "2025-06-10T14:30:00Z",
        description: "From reducing waste to sourcing local, learn practical tips for making your next event environmentally conscious without sacrificing quality.",
        gallery: []
    },
    {
        id: "news-003",
        title: "AI's Role in Personalizing the Attendee Journey",
        source: "TechCrunch",
        imageUrl: "https://placehold.co/600x400.png",
         "data-ai-hint": "artificial intelligence",
        articleUrl: "https://example.com/news3",
        publishedDate: "2025-06-05T09:00:00Z",
        description: "Discover how artificial intelligence is reshaping event marketing, from personalized recommendations to AI-powered networking tools that connect the right people.",
        gallery: []
    }
];

export const initialTickets: Ticket[] = [
    {
        id: 'ticket-001',
        eventId: 'event-001',
        attendeeName: 'John Doe',
        attendeeEmail: 'johndoe@example.com',
        purchaseDate: '2025-06-01T10:00:00Z',
        checkedIn: false,
        price: 150
    },
    {
        id: 'ticket-002',
        eventId: 'event-001',
        attendeeName: 'Jane Smith',
        attendeeEmail: 'janesmith@example.com',
        purchaseDate: '2025-06-02T11:30:00Z',
        checkedIn: true,
        price: 150
    },
    {
        id: 'ticket-003',
        eventId: 'event-002',
        attendeeName: 'Alice Johnson',
        attendeeEmail: 'alicej@example.com',
        purchaseDate: '2025-06-03T15:00:00Z',
        checkedIn: false,
        price: 25
    }
];

export const initialLaunchSubscribers: LaunchSubscriber[] = [
    { id: 'sub-001', name: 'Kwame Brown', email: 'kwame@example.com', subscribedAt: '2025-05-20T10:00:00Z' },
    { id: 'sub-002', name: 'Ama Adjei', email: 'ama@example.com', subscribedAt: '2025-05-21T12:00:00Z' }
];

export const initialContactSubmissions: ContactSubmission[] = [
    {
        id: 'contact-001',
        name: 'Event Organizer Pro',
        email: 'organizer@example.com',
        subject: 'Partnership Inquiry',
        category: 'Partnership',
        message: 'I would like to discuss partnership opportunities for my series of events.',
        status: 'new',
        submittedAt: '2025-06-12T09:00:00Z',
    },
     {
        id: 'contact-002',
        name: 'Curious Attendee',
        email: 'attendee@example.com',
        subject: 'Question about refunds',
        category: 'Billing & Payments',
        message: 'How do I request a refund for a ticket I purchased?',
        status: 'read',
        submittedAt: '2025-06-11T16:30:00Z',
    }
];
