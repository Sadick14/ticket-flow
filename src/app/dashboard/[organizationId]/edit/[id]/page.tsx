
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreateEventForm } from '@/components/create-event-form';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import { Loader2 } from 'lucide-react';
import type { Event, Organization } from '@/lib/types';

export default function EditEventPage() {
  const { user, loading: authLoading } = useAuth();
  const { getEventById, organizations } = useAppContext();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const organizationId = params.organizationId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }
    if (!organizationId) {
        setError("No organization context. Please go back and select an organization.");
        setLoading(false);
        return;
    }

    const org = organizations.find(o => o.id === organizationId);
    if (!org?.memberIds.includes(user.uid)) {
        setError("You don't have permission to manage this organization.");
        setLoading(false);
        return;
    }

    if (id) {
      getEventById(id)
        .then(eventData => {
          if (eventData) {
            if (eventData.organizationId !== organizationId) {
               setError("This event does not belong to the selected organization.");
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
  }, [id, user, authLoading, getEventById, router, organizationId, organizations]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  

  return (
    <>
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
