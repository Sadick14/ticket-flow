"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/context/app-context';
import type { Ticket, Event } from '@/lib/types';
import { ViewTicketDialog } from '@/components/view-ticket-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket as TicketIcon } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function TicketsPage() {
  const { tickets, getEventById } = useAppContext();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleViewTicket = (ticket: Ticket) => {
    const event = getEventById(ticket.eventId);
    if (event) {
      setSelectedTicket(ticket);
      setSelectedEvent(event);
      setIsViewModalOpen(true);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-headline">My Tickets</h1>
          <p className="mt-2 text-lg text-muted-foreground">Here are all the tickets you have purchased.</p>
        </div>

        {tickets.length > 0 ? (
          <div className="space-y-6">
            {tickets.map(ticket => {
              const event = getEventById(ticket.eventId);
              if (!event) return null;

              const eventDate = new Date(`${event.date}T${event.time}`);

              return (
                <Card key={ticket.id} className="overflow-hidden sm:flex transition-all hover:shadow-md">
                   <div className="relative h-48 sm:h-auto sm:w-48 flex-shrink-0">
                     <Image src={event.imageUrl} alt={event.name} layout="fill" objectFit="cover" data-ai-hint={`${event.category.toLowerCase()}`} />
                   </div>
                   <CardContent className="p-6 flex-grow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div className="flex-grow">
                        <h2 className="text-xl font-bold font-headline">{event.name}</h2>
                        <p className="text-muted-foreground mt-1">{format(eventDate, 'PPPp')}</p>
                        <p className="text-muted-foreground">{event.location}</p>
                     </div>
                     <Button onClick={() => handleViewTicket(ticket)}>View Ticket</Button>
                   </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No Tickets Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">You haven&apos;t purchased any tickets yet.</p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/">Browse Events</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedTicket && selectedEvent && (
        <ViewTicketDialog
          ticket={selectedTicket}
          event={selectedEvent}
          isOpen={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
        />
      )}
    </>
  );
}
