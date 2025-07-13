
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  slug: 'tickets',
  title: 'My Tickets - TicketFlow',
  description: 'View and manage all your event tickets in one place. Access your QR codes, event details, and download tickets for upcoming events.',
  image: '/og-tickets.jpg',
});

"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import type { Ticket, Event } from '@/lib/types';
import { ViewTicketDialog } from '@/components/view-ticket-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket as TicketIcon, Loader2, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

function TicketCard({ ticket }: { ticket: Ticket }) {
  const { getEventById } = useAppContext();
  const [event, setEvent] = useState<Event | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      const eventData = await getEventById(ticket.eventId);
      if (eventData) setEvent(eventData);
    };
    fetchEvent();
  }, [ticket.eventId, getEventById]);

  if (!event) {
    return (
      <Card className="overflow-hidden sm:flex transition-all hover:shadow-md p-6 h-[124px] items-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </Card>
    );
  }

  const eventDate = new Date(`${event.date}T${event.time}`);

  return (
    <>
      <Card
        className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
        onClick={() => setIsViewModalOpen(true)}
      >
        <div className="flex">
          <div className="relative h-auto w-32 flex-shrink-0 hidden sm:block">
            <Image
              src={event.imageUrl}
              alt={event.name}
              layout="fill"
              objectFit="cover"
              data-ai-hint={`${event.category.toLowerCase()}`}
            />
          </div>
          <CardContent className="p-4 sm:p-6 flex-grow flex justify-between items-center gap-4">
            <div className="flex-grow">
              <p className="text-sm text-primary font-semibold">{event.category.toUpperCase()}</p>
              <h2 className="text-xl font-bold font-headline">{event.name}</h2>
              <div className="text-muted-foreground text-sm mt-2 space-y-1">
                 <div className="flex items-center">
                   <Calendar className="mr-2 h-4 w-4" />
                   <span>{format(eventDate, 'eee, MMM dd, yyyy')} at {format(eventDate, 'p')}</span>
                 </div>
                 <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{event.location}</span>
                 </div>
              </div>
            </div>
            <div className="flex items-center">
                <Button variant="ghost" size="icon">
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>
          </CardContent>
        </div>
      </Card>
      {event && (
        <ViewTicketDialog
          ticket={ticket}
          event={event}
          isOpen={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
        />
      )}
    </>
  );
}


export default function TicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const { getUserTickets, loading: appLoading } = useAppContext();
  const [attendeeEmail, setAttendeeEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    if (user) {
      setAttendeeEmail(user.email);
    }
  }, [user]);

  const handleShowTickets = () => {
    if (emailInput) {
      setAttendeeEmail(emailInput);
    }
  };

  if (authLoading || appLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  const userTickets = attendeeEmail ? getUserTickets(attendeeEmail) : [];

  return (
    <>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-headline">My Tickets</h1>
          <p className="mt-2 text-lg text-muted-foreground">Here are all the tickets you have purchased.</p>
        </div>

        {!attendeeEmail ? (
            <Card className="max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                    <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">Find Your Tickets</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Enter the email address you used during purchase to view your tickets.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-2">
                        <Input 
                            type="email" 
                            placeholder="Enter your email" 
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleShowTickets()}
                        />
                        <Button onClick={handleShowTickets}>Show My Tickets</Button>
                    </div>
                </CardContent>
            </Card>
        ) : userTickets.length > 0 ? (
          <div className="space-y-6">
            {userTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No Tickets Found for {attendeeEmail}</h3>
            <p className="mt-1 text-sm text-muted-foreground">You haven&apos;t purchased any tickets with this email yet.</p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/">Browse Events</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
