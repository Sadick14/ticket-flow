
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Ticket } from '@/lib/types';

interface AddTicketRequest {
  eventId: string;
  attendees: { attendeeName: string; attendeeEmail: string }[];
  price: number;
  transactionId?: string; // Optional for paid tickets
}

export async function POST(request: NextRequest) {
  try {
    const { eventId, attendees, price, transactionId }: AddTicketRequest = await request.json();

    if (!eventId || !attendees || attendees.length === 0) {
      return NextResponse.json({ error: 'Missing required ticket data' }, { status: 400 });
    }

    const ticketsCollection = collection(db, 'tickets');
    const newTicketsData = [];

    // Using a loop to create tickets one by one to get their IDs for the response
    for (const attendee of attendees) {
      const newTicket: Omit<Ticket, 'id'> = {
        eventId,
        attendeeName: attendee.attendeeName,
        attendeeEmail: attendee.attendeeEmail,
        price,
        purchaseDate: new Date().toISOString(), // Placeholder
        checkedIn: false,
        ...(transactionId && { gatewayTransactionId: transactionId })
      };
      
      const docRef = await addDoc(ticketsCollection, {
        ...newTicket,
        purchaseDate: serverTimestamp(),
      });
      newTicketsData.push({ id: docRef.id, ...newTicket });
    }

    // After successfully creating tickets, send confirmation emails
    for (const ticket of newTicketsData) {
        try {
            // Using absolute URL for server-side fetch
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
            const emailResponse = await fetch(`${appUrl}/api/send-confirmation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: ticket.eventId,
                    attendeeName: ticket.attendeeName,
                    attendeeEmail: ticket.attendeeEmail,
                }),
            });
            if (!emailResponse.ok) {
                const errorData = await emailResponse.json();
                console.error(`Failed to send confirmation email to ${ticket.attendeeEmail}:`, errorData.error);
            }
        } catch (emailError) {
            console.error(`Error triggering confirmation email for ${ticket.attendeeEmail}:`, emailError);
        }
    }

    return NextResponse.json({ success: true, message: 'Tickets created successfully.', tickets: newTicketsData });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket.' }, { status: 500 });
  }
}
