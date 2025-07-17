
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Ticket } from '@/lib/types';

interface AddTicketRequest {
  eventId: string;
  attendees: { attendeeName: string; attendeeEmail: string }[];
  price: number;
}

export async function POST(request: NextRequest) {
  try {
    const { eventId, attendees, price }: AddTicketRequest = await request.json();

    if (!eventId || !attendees || attendees.length === 0) {
      return NextResponse.json({ error: 'Missing required ticket data' }, { status: 400 });
    }

    const batch = attendees.map(attendee => {
        const newTicket: Omit<Ticket, 'id'> = {
            eventId,
            attendeeName: attendee.attendeeName,
            attendeeEmail: attendee.attendeeEmail,
            price,
            purchaseDate: new Date().toISOString(), // This will be replaced by server timestamp
            checkedIn: false,
        };
        return addDoc(collection(db, 'tickets'), {
            ...newTicket,
            purchaseDate: serverTimestamp()
        });
    });

    await Promise.all(batch);

    // After successfully creating tickets, send confirmation emails for each attendee
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
            // Log the email error but don't fail the whole request
            console.error(`Failed to send confirmation email to ${attendee.attendeeEmail}:`, emailError);
        }
    }


    return NextResponse.json({ success: true, message: 'Tickets created successfully.' });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket.' }, { status: 500 });
  }
}
