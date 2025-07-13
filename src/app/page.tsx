
<<<<<<< HEAD
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
=======
'use client';
import { LaunchPage } from './launch/page';

export default function Home() {
    return <LaunchPage />;
>>>>>>> 1563c37 (since I am lauching on Monday 12pm let create a timer page till then, wh)
}
