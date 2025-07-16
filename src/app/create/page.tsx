
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import {CreateEventForm} from '@/components/create-event-form';
import { PageHero } from '@/components/page-hero';

export const metadata: Metadata = generatePageMetadata({
  slug: 'create',
  title: 'Create an Event - TicketFlow',
  description: 'Bring your vision to life. Create and publish your event on TicketFlow in minutes with our easy-to-use event creation tools.',
  image: '/og-create.jpg',
});


export default function CreateEventPage() {
  return (
    <>
        <PageHero
            title="Create Your Event"
            description="Turn your idea into a reality. Fill out the form below to get started."
            height="sm"
        />
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <CreateEventForm />
        </div>
    </>
  );
}
