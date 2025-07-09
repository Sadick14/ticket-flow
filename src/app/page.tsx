"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event-card';
import { PurchaseTicketDialog } from '@/components/purchase-ticket-dialog';
import { useAppContext } from '@/context/app-context';
import type { Event } from '@/lib/types';
import Link from 'next/link';

export default function Home() {
  const { events } = useAppContext();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const handlePurchaseClick = (event: Event) => {
    setSelectedEvent(event);
    setIsPurchaseModalOpen(true);
  };

  return (
    <>
      <div className="w-full">
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground py-20 sm:py-32">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-primary/80 backdrop-blur-sm"
          ></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-headline">
              Discover & Manage Events Easily
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-primary-foreground/80">
              The all-in-one platform for event organizers and attendees. Buy tickets, manage events, and track attendance seamlessly.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
               <Button asChild size="lg" variant="secondary">
                 <Link href="#events">
                    Browse Events
                 </Link>
               </Button>
               <Button asChild size="lg" variant="outline">
                 <Link href="/create">
                    Create an Event
                 </Link>
               </Button>
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        <section id="events" className="py-16 sm:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-accent-foreground font-semibold tracking-wide uppercase font-headline">Upcoming Events</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
                Don&apos;t miss these exciting events
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
                Browse through our curated selection of upcoming events.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} onPurchaseClick={() => handlePurchaseClick(event)} />
              ))}
            </div>
          </div>
        </section>
      </div>

      {selectedEvent && (
        <PurchaseTicketDialog
          event={selectedEvent}
          isOpen={isPurchaseModalOpen}
          onOpenChange={setIsPurchaseModalOpen}
        />
      )}
    </>
  );
}
