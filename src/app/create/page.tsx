
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
      // User is not logged in, but we won't redirect. We'll show a message.
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
      <div className="bg-background">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
           <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-headline">
            Sign In to Create an Event
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Please sign in with your Google account to access the event creation tools.
          </p>
          <Button size="lg" className="mt-8" onClick={signInWithGoogle}>
            Sign In with Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-headline">
            Create and manage your events
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Our powerful tools make event management simple and effective.
          </p>
        </div>
        <CreateEventForm />
      </div>
    </div>
  );
}
