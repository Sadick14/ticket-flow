import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateEventMetadata, generateEventStructuredData } from '@/lib/metadata';
import EventDetailsClient from './event-details-client';

// Mock function to get event data - replace with your actual data fetching
async function getEventData(id: string) {
  // This would typically fetch from your database
  // For now, return mock data structure
  return {
    id,
    title: 'Sample Event',
    description: 'This is a sample event description',
    image: '/uploads/sample-event.jpg',
    date: new Date().toISOString(),
    location: 'Sample Location',
    price: 25,
    organizer: 'Event Organizer',
    tags: ['technology', 'conference'],
  };
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    const event = await getEventData(params.id);
    
    if (!event) {
      return {
        title: 'Event Not Found | TicketFlow',
        description: 'The requested event could not be found.',
      };
    }

    return generateEventMetadata(event);
  } catch (error) {
    return {
      title: 'Event | TicketFlow',
      description: 'View event details and purchase tickets on TicketFlow.',
    };
  }
}

export default async function EventDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const event = await getEventData(params.id);
    
    if (!event) {
      notFound();
    }

    // Generate structured data for SEO
    const structuredData = generateEventStructuredData(event);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <EventDetailsClient eventId={params.id} />
      </>
    );
  } catch (error) {
    notFound();
  }
}
