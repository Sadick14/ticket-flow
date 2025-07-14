
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import TicketsPageClient from './tickets-client';

export const metadata: Metadata = generatePageMetadata({
  slug: 'tickets',
  title: 'My Tickets - TicketFlow',
  description: 'View and manage all your event tickets in one place. Access your QR codes, event details, and download tickets for upcoming events.',
  image: '/og-tickets.jpg',
});

export default function TicketsPage() {
  return <TicketsPageClient />;
}
