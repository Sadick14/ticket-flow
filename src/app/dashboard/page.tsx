
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
      // Not redirecting, show sign-in prompt
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
       <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-headline">Access Your Dashboard</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Please sign in to manage your events.
        </p>
        <Button size="lg" className="mt-8" onClick={signInWithGoogle}>Sign In with Google</Button>
      </div>
    );
  }

  const userEvents = getEventsByCreator(user.uid);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-headline">My Events Dashboard</h1>
          <p className="mt-2 text-lg text-muted-foreground">Here are all the events you have created.</p>
        </div>
        <Button asChild>
          <Link href="/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Event
          </Link>
        </Button>
      </div>

      {userEvents.length > 0 ? (
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
