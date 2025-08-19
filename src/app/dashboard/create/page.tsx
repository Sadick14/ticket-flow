
'use client';

import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import {CreateEventForm} from '@/components/create-event-form';
import { useParams } from 'next/navigation';

// export const metadata: Metadata = generatePageMetadata({
//   slug: 'dashboard/create',
//   title: 'Create Event - TicketFlow',
//   description: 'Create and manage your events with ease. Set up tickets, manage attendees, and track sales all in one place with TicketFlow\'s powerful event management tools.',
//   image: '/og-create.jpg',
// });


export default function CreateEventPage() {
  const params = useParams();
  const organizationId = params.organizationId as string;

  return (
    <div className="max-w-4xl mx-auto">
        <CreateEventForm />
    </div>
  );
}
