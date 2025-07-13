
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  slug: 'create',
  title: 'Create Event - TicketFlow',
  description: 'Create and manage your events with ease. Set up tickets, manage attendees, and track sales all in one place with TicketFlow\'s powerful event management tools.',
  image: '/og-create.jpg',
});

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreateEventForm } from '@/components/create-event-form';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateEventPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
        router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="text-left mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-headline">
            Create a new event
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Fill in the details below to get started.
        </p>
        </div>
        <CreateEventForm />
    </div>
  );
}
