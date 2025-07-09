
import type { Event } from './types';

export const initialEvents: Event[] = [
  {
    id: '1',
    creatorId: 'user1',
    name: 'Summer Music Festival',
    date: '2024-08-15',
    endDate: '2024-08-17',
    time: '18:00',
    location: 'Central Park, New York',
    description: 'Join us for the biggest music festival of the summer featuring top artists from around the world. Enjoy live performances, food trucks, and an unforgettable atmosphere under the stars.',
    price: 49.99,
    capacity: 5000,
    category: 'Music',
    imageUrl: 'https://placehold.co/600x400.png',
    speakers: [
      { name: 'DJ Beatmaster', title: 'Headliner DJ', imageUrl: 'https://placehold.co/100x100.png' },
      { name: 'The Rockers', title: 'Live Band', imageUrl: 'https://placehold.co/100x100.png' }
    ],
    activities: [
      { name: 'Gates Open', time: '04:00 PM', description: 'Doors open for all ticket holders.' },
      { name: 'Opening Act: The Upstarts', time: '06:00 PM', description: 'Kicking off the festival with some fresh talent.' },
      { name: 'Headline Performance', time: '08:00 PM', description: 'The main event you\'ve been waiting for!' }
    ],
    sponsors: [
      { name: 'SoundWave Audio', logoUrl: 'https://placehold.co/150x75.png' },
      { name: 'Buzz Cola', logoUrl: 'https://placehold.co/150x75.png' }
    ]
  },
  {
    id: '2',
    creatorId: 'user2',
    name: 'Tech Conference 2024',
    date: '2024-09-22',
    time: '09:00',
    location: 'Convention Center, San Francisco',
    description: 'Learn from industry leaders about the latest trends in technology and innovation. Network with professionals and discover the future of tech.',
    price: 199.99,
    capacity: 1000,
    category: 'Technology',
    imageUrl: 'https://placehold.co/600x400.png',
     speakers: [
      { name: 'Alex Chen', title: 'CEO, Innovate Corp', imageUrl: 'https://placehold.co/100x100.png' },
      { name: 'Brenda Lee', title: 'Lead AI Researcher', imageUrl: 'https://placehold.co/100x100.png' },
      { name: 'Chris Evans', title: 'Cybersecurity Expert', imageUrl: 'https://placehold.co/100x100.png' }
    ],
    activities: [
      { name: 'Registration & Welcome Coffee', time: '09:00 AM', description: 'Kick off the day with registration and networking over coffee.' },
      { name: 'Opening Keynote: The Future of AI', time: '10:00 AM', description: 'Insightful opening session by Alex Chen.' },
      { name: 'Panel: Quantum Computing', time: '11:00 AM', description: 'Engaging panel on the breakthroughs in quantum computing.' }
    ],
    sponsors: [
        { name: 'FutureTech Inc.', logoUrl: 'https://placehold.co/150x75.png'},
        { name: 'DevTools Pro', logoUrl: 'https://placehold.co/150x75.png'}
    ]
  },
  {
    id: '3',
    creatorId: 'user1',
    name: 'Food & Wine Expo',
    date: '2024-10-05',
    time: '12:00',
    location: 'Exhibition Hall, Chicago',
    description: 'Experience the finest culinary delights and wines from around the world. A paradise for food lovers and connoisseurs.',
    price: 79.99,
    capacity: 2000,
    category: 'Food & Drink',
    imageUrl: 'https://placehold.co/600x400.png',
    speakers: [
      { name: 'Chef Antoine', title: 'Michelin Star Chef', imageUrl: 'https://placehold.co/100x100.png' },
      { name: 'Isabella Rossi', title: 'Master Sommelier', imageUrl: 'https://placehold.co/100x100.png' }
    ],
    activities: [
      { name: 'Grand Tasting Hall Opens', time: '12:00 PM', description: 'Sample hundreds of wines and dishes.' },
      { name: 'Cooking Demo with Chef Antoine', time: '02:00 PM', description: 'Learn secrets from a master chef.' },
      { name: 'Wine Pairing Masterclass', time: '04:00 PM', description: 'Discover the art of pairing food and wine with Isabella Rossi.' }
    ],
    sponsors: []
  },
    {
    id: '4',
    creatorId: 'user3',
    name: 'Marathon Challenge',
    date: '2024-09-10',
    time: '07:00',
    location: 'Downtown, Boston',
    description: 'Join thousands of runners for the annual city marathon. A test of endurance and spirit.',
    price: 89.99,
    capacity: 10000,
    category: 'Sports',
    imageUrl: 'https://placehold.co/600x400.png',
    speakers: [],
    activities: [
       { name: 'Runner Check-in', time: '06:00 AM', description: 'Final check-in and bib collection.' },
       { name: 'Race Start', time: '07:00 AM', description: 'The marathon begins!' },
       { name: 'Post-Race Celebration', time: '11:00 AM', description: 'Celebrate your achievement with music and refreshments.' }
    ],
    sponsors: [
        { name: 'GoFast Shoes', logoUrl: 'https://placehold.co/150x75.png' }
    ]
  },
  {
    id: '5',
    creatorId: 'user2',
    name: 'Art Exhibition Opening',
    date: '2024-10-18',
    time: '19:00',
    location: 'Modern Art Museum, Los Angeles',
    description: 'Exclusive preview of the new contemporary art exhibition. Mingle with the artists and fellow art enthusiasts.',
    price: 29.99,
    capacity: 500,
    category: 'Arts & Theater',
    imageUrl: 'https://placehold.co/600x400.png',
    speakers: [
        { name: 'Elena Petrova', title: 'Featured Artist', imageUrl: 'https://placehold.co/100x100.png' }
    ],
     activities: [
       { name: 'Cocktail Reception', time: '07:00 PM', description: 'Enjoy drinks and hors d\'oeuvres.' },
       { name: 'Artist Talk with Elena Petrova', time: '08:00 PM', description: 'Hear from the artist about her work.' },
       { name: 'Gallery Viewing', time: '08:30 PM', description: 'Explore the new exhibition.' }
    ],
    sponsors: []
  },
  {
    id: '6',
    creatorId: 'user3',
    name: 'Startup Pitch Night',
    date: '2024-11-08',
    time: '17:30',
    location: 'Innovation Hub, Austin',
    description: 'Watch promising startups pitch their ideas to investors. Discover the next big thing.',
    price: 39.99,
    capacity: 300,
    category: 'Business',
    imageUrl: 'https://placehold.co/600x400.png',
    speakers: [
        { name: 'Venture Capital Panel', title: 'Investors', imageUrl: 'https://placehold.co/100x100.png' }
    ],
    activities: [
       { name: 'Networking Mixer', time: '05:30 PM', description: 'Connect with founders and investors.' },
       { name: 'Pitch Session', time: '06:30 PM', description: 'Startups present their ideas.' },
       { name: 'Investor Q&A', time: '08:00 PM', description: 'Q&A session with the investor panel.' }
    ],
    sponsors: []
  }
];
