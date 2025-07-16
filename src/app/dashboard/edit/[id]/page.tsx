
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreateEventForm } from '@/components/create-event-form';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import { Loader2 } from 'lucide-react';
import type { Event } from '@/lib/types';
import { AiAssistant } from '@/components/ai-assistant';

export default function EditEventPage() {
  const { user, loading: authLoading } = useAuth();
  const { getEventById } = useAppContext();
  const router = useRouter();
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }

    if (id) {
      getEventById(id as string)
        .then(eventData => {
          if (eventData) {
            if (eventData.creatorId !== user.uid) {
               setError("You don't have permission to edit this event.");
            } else {
               setEvent(eventData);
            }
          } else {
            setError('Event not found.');
          }
        })
        .catch(() => setError('Failed to load event data.'))
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [id, user, authLoading, getEventById, router]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const aiAssistantEventDetails = event ? {
      name: event.name,
      category: event.category,
      location: event.location,
      capacity: event.capacity,
  } : { name: '', category: '', location: '', capacity: 0 };


  return (
    <>
    <AiAssistant eventDetails={aiAssistantEventDetails} />
    <div className="max-w-4xl mx-auto">
        <div className="text-left mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-headline">
            Edit Event
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Update the details for your event below.
        </p>
        </div>
        {error ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg text-destructive">
                <h3 className="text-lg font-medium">{error}</h3>
            </div>
        ) : event ? (
            <CreateEventForm eventToEdit={event} />
        ) : (
             <div className="flex justify-center items-center h-full">
                <p>No event found to edit.</p>
            </div>
        )}
    </div>
    </>
  );
}
