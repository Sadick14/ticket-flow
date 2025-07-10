
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import { Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EventCard } from '@/components/event-card';

export default function DashboardPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { events, getEventsByCreator } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const userEvents = getEventsByCreator(user.uid);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">My Events</h1>
          <p className="mt-1 text-lg text-muted-foreground">Here are all the events you have created.</p>
        </div>
        <Button asChild>
          <Link href="/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Event
          </Link>
        </Button>
      </div>

      {userEvents.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {userEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="mt-4 text-lg font-medium text-foreground">No Events Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">You haven't created any events yet.</p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/create">Create Your First Event</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
