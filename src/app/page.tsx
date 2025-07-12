
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event-card';
import { useAppContext } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const { events, loading } = useAppContext();

  return (
    <>
      <div className="w-full">
        {/* Hero Section */}
        <section className="bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center py-20 sm:py-32">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl font-headline">
                  Where Events Come to Life
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-muted-foreground">
                  The all-in-one platform for event organizers and attendees. Buy tickets, manage events, and track attendance seamlessly.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                  <Button asChild size="lg">
                    <Link href="#events">
                      Browse Events
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/create">
                      Create an Event
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block">
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="Exciting event"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                  data-ai-hint="event concert"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        <section id="events" className="py-16 sm:py-24 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-primary font-semibold tracking-wide uppercase font-headline">Upcoming Events</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
                Don&apos;t miss these exciting events
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
                Browse through our curated selection of upcoming events.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                events.slice(0, 6).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </div>
            {events.length > 6 && (
                <div className="mt-16 text-center">
                    <Button asChild size="lg">
                        <Link href="/events">View All Events</Link>
                    </Button>
                </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
