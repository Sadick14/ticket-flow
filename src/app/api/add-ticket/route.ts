
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

    const batch = writeBatch(db);

    for (const attendee of attendees) {
      const newTicket: Omit<Ticket, 'id'> = {
        eventId,
        attendeeName: attendee.attendeeName,
        attendeeEmail: attendee.attendeeEmail,
        price,
        purchaseDate: new Date().toISOString(), // Placeholder
        checkedIn: false,
      };
      const ticketRef = addDoc(ticketsCollection, {
        ...newTicket,
        purchaseDate: serverTimestamp(),
        ...(transactionId && { gatewayTransactionId: transactionId })
      });
      
      // We need the ID for the response, so we'll have to create them one by one
      // If we don't need the ID back, we can use a writeBatch for efficiency
      const docRef = await ticketRef;
      newTicketsData.push({ id: docRef.id, ...attendee });
    }

    // Since we're not using batch for creation now, we commit one by one above.
    // If you switch back to batch, uncomment the next line.
    // await batch.commit();

    // After successfully creating tickets, send confirmation emails
    for (const attendee of attendees) {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-confirmation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    attendeeName: attendee.attendeeName,
                    attendeeEmail: attendee.attendeeEmail,
                }),
            });
        } catch (emailError) {
            console.error(`Failed to send confirmation email to ${attendee.attendeeEmail}:`, emailError);
        }
    }

    return NextResponse.json({ success: true, message: 'Tickets created successfully.', tickets: newTicketsData });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket.' }, { status: 500 });
  }
}
