
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

    for (const attendee of attendees) {
      const newTicket = {
        eventId,
        attendeeName: attendee.attendeeName,
        attendeeEmail: attendee.attendeeEmail,
        price,
        purchaseDate: new Date().toISOString(),
        checkedIn: false,
      };
      // Add the ticket to Firestore
      await addDoc(collection(db, 'tickets'), newTicket);
      
      // Send confirmation email
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          attendeeName: attendee.attendeeName,
          attendeeEmail: attendee.attendeeEmail,
        }),
      });
    }

    return NextResponse.json({ success: true, message: 'Tickets created successfully.' });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket.' }, { status: 500 });
  }
}
