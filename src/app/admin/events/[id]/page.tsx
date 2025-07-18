
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import type { Event, Ticket } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Users, Hourglass, CheckCircle, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AdminEventDetailsPage() {
  const { id } = useParams();
  const { getEventById, getTicketsByEvent, updateTicket, loading } = useAppContext();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const eventId = Array.isArray(id) ? id[0] : id;
      getEventById(eventId).then(setEvent);
      setTickets(getTicketsByEvent(eventId));
    }
  }, [id, getEventById, getTicketsByEvent]);

  useEffect(() => {
    if (id) {
       setTickets(getTicketsByEvent(Array.isArray(id) ? id[0] : id));
    }
  }, [id, getTicketsByEvent, loading]);


  const handleApprovePayment = async (ticketId: string) => {
    setIsApproving(ticketId);
    try {
      await updateTicket(ticketId, { status: 'confirmed' });
      toast({
        title: 'Payment Approved',
        description: 'The ticket has been confirmed.',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Approval Failed',
        description: 'Could not update the ticket status.',
      });
    } finally {
      setIsApproving(null);
    }
  };

  const getStatusBadge = (status: 'pending' | 'confirmed') => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive"><Hourglass className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="mr-1 h-3 w-3" />Confirmed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading || !event) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/admin/events"><ArrowLeft className="h-4 w-4"/></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {format(parseISO(event.date), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Attendee List & Payment Approval</CardTitle>
          <CardDescription>
            {tickets.length} ticket(s) reserved for this event. Approve payments to confirm bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Booking Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      No attendees yet for this event.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="font-medium">{ticket.attendeeName}</div>
                        <div className="text-sm text-muted-foreground">{ticket.attendeeEmail}</div>
                      </TableCell>
                       <TableCell>
                        <Badge variant="secondary" className="font-mono">{ticket.bookingCode}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-right">
                        {ticket.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleApprovePayment(ticket.id)}
                            disabled={isApproving === ticket.id}
                          >
                            {isApproving === ticket.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
