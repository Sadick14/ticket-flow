
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateEventMetadata, generateEventStructuredData } from '@/lib/metadata';
import EventDetailsClient from './event-details-client';
import { db } from '@/lib/firebase';
import { doc, getDoc } from "firebase/firestore";
import type { Event } from '@/lib/types';


async function getEventData(id: string): Promise<Event | null> {
  const docRef = doc(db, 'events', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // The name property is what is expected by generateEventMetadata
    const data = docSnap.data();
    return { id: docSnap.id, ...data, name: data.name, title: data.name } as Event;
  }
  return null;
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
    
    // The title property is what is expected by generateEventMetadata
    const eventForMetadata = {...event, title: event.name };
    return generateEventMetadata(eventForMetadata);
  } catch (error) {
    console.error('Error generating metadata:', error);
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
  const event = await getEventData(params.id);
  
  if (!event) {
    notFound();
  }

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
}
