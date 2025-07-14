
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import {CreateEventForm} from '@/components/create-event-form';

export const metadata: Metadata = generatePageMetadata({
  slug: 'dashboard/create',
  title: 'Create Event - TicketFlow',
  description: 'Create and manage your events with ease. Set up tickets, manage attendees, and track sales all in one place with TicketFlow\'s powerful event management tools.',
  image: '/og-create.jpg',
});


export default function CreateEventPage() {
  return (
    <div className="max-w-4xl mx-auto">
        <CreateEventForm />
    </div>
  );
}
