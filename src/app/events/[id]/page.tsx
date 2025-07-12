
import type { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Event } from '@/lib/types';
import { EventDetailsView } from '@/components/event-details-view';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const eventId = params.id;
  const eventRef = doc(db, 'events', eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    return {
      title: 'Event Not Found',
    }
  }

  const event = eventSnap.data() as Event;

  return {
    title: `${event.name} | TicketFlow`,
    description: event.description,
    openGraph: {
      title: event.name,
      description: event.description,
      images: [
        {
          url: event.imageUrl,
          width: 1200,
          height: 630,
          alt: event.name,
        },
      ],
      url: `/events/${eventId}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.name,
      description: event.description,
      images: [event.imageUrl],
    },
  }
}

async function getEvent(id: string): Promise<Event | null> {
    const eventRef = doc(db, 'events', id);
    const eventSnap = await getDoc(eventRef);
    if (!eventSnap.exists()) {
        return null;
    }
    return { id: eventSnap.id, ...eventSnap.data() } as Event;
}


export default async function EventDetailsPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  return <EventDetailsView initialEvent={event} />;
}
