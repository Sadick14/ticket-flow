
"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import type { Ticket, Event } from '@/lib/types';
import { ViewTicketDialog } from '@/components/view-ticket-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket as TicketIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { TicketCard } from '@/components/ticket-card';

export default function TicketsPageClient() {
  const { user, loading: authLoading } = useAuth();
  const { getUserTickets, loading: appLoading, getEventById } = useAppContext();
  const [attendeeEmail, setAttendeeEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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

  const handleViewTicket = async (ticket: Ticket) => {
    const eventData = await getEventById(ticket.eventId);
    if (eventData) {
      setSelectedTicket(ticket);
      setSelectedEvent(eventData);
      setIsViewModalOpen(true);
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
            {userTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} onViewTicket={() => handleViewTicket(ticket)} />
            ))}
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
