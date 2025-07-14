
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import PricingClientPage from './pricing-client';

export const metadata: Metadata = generatePageMetadata({
  slug: 'pricing',
  title: 'Pricing Plans - TicketFlow',
  description: 'Choose the perfect plan for your event management needs. From free events to enterprise solutions, TicketFlow has flexible pricing for organizers of all sizes.',
  image: '/og-pricing.jpg',
});

export default function PricingPage() {
    return <PricingClientPage />;
}
