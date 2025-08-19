
'use client';

import { Metadata } from 'next';
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
      <div className="text-left mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-headline">
          Create a New Event
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Fill out the form below to get started. You can use our AI Assistant to help you with content.
        </p>
      </div>
      <CreateEventForm />
    </div>
  );
}
