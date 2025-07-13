
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import CreateEventClientPage from './create-client-page';

export const metadata: Metadata = generatePageMetadata({
  slug: 'create',
  title: 'Create Event - TicketFlow',
  description: 'Create and manage your events with ease. Set up tickets, manage attendees, and track sales all in one place with TicketFlow\'s powerful event management tools.',
  image: '/og-create.jpg',
});


export default function CreateEventPage() {
  return <CreateEventClientPage />;
}
