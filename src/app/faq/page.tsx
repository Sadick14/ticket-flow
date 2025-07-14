
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import FaqClientPage from './faq-client';

export const metadata: Metadata = generatePageMetadata({
  slug: 'faq',
  title: 'FAQ - Frequently Asked Questions | TicketFlow',
  description: 'Find answers to common questions about TicketFlow event management platform. Get help with creating events, managing tickets, and using our features.',
  image: '/og-faq.jpg',
});

export default function FAQPage() {
    return <FaqClientPage />;
}
