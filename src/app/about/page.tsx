
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import AboutClientPage from './about-client';

export const metadata: Metadata = generatePageMetadata({
  slug: 'about',
  title: 'About Us - Learn About TicketFlow',
  description: 'Discover the story behind TicketFlow, our mission to democratize event creation, and meet the passionate team building the future of event management.',
  image: '/og-about.jpg',
});

export default function AboutPage() {
  return <AboutClientPage />;
}
