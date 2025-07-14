
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import HelpCenterClientPage from './help-center-client';


export const metadata: Metadata = generatePageMetadata({
  slug: 'help-center',
  title: 'Help Center - TicketFlow Support & Resources',
  description: 'Get help with TicketFlow! Access guides, tutorials, and support resources for event creation, ticket sales, and platform features.',
  image: '/og-help.jpg',
});

export default function HelpCenterPage() {
    return <HelpCenterClientPage />;
}
