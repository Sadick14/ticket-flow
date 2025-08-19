
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import MyTicketsClient from './tickets-client';

export const metadata: Metadata = generatePageMetadata({
  slug: 'tickets',
  title: 'My Tickets - TicketFlow',
  description: 'View all your purchased tickets for upcoming events. Access your QR codes for easy check-in.',
  image: '/og-tickets.jpg',
});

export default function MyTicketsPage() {
  return <MyTicketsClient />;
}
