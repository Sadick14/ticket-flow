
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import HomePageClient from './home-client';

export const metadata: Metadata = generatePageMetadata({
  slug: '',
  title: 'TicketFlow - The Ultimate Event Management Platform',
  description: 'Create, manage, and sell tickets for your events effortlessly. Join thousands of event organizers using TicketFlow for seamless event management with real-time analytics and automated communications.',
  image: '/og-default.jpg',
});

export default function HomePage() {
  return <HomePageClient />;
}
