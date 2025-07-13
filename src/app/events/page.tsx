
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import EventsPageClient from './events-client';

export const metadata: Metadata = generatePageMetadata({
  slug: 'events',
  title: 'Browse Events - TicketFlow',
  description: 'Discover exciting events happening around you. Browse upcoming concerts, conferences, workshops, and more. Find your next experience with TicketFlow.',
  image: '/og-events.jpg',
});

export default function EventsPage() {
  return <EventsPageClient />;
}
