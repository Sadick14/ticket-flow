
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, renderTemplate } from '@/lib/email';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Event } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface ConfirmationRequest {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
}

async function getEventById(id: string): Promise<Event | null> {
  const docRef = doc(db, 'events', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Event;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { eventId, attendeeName, attendeeEmail }: ConfirmationRequest = await request.json();

    if (!eventId || !attendeeName || !attendeeEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    const eventDate = parseISO(`${event.date}T${event.time}`);
    const emailContent = renderTemplate('ticketConfirmation', {
        eventName: event.name,
        eventDate: format(eventDate, 'PPP p'),
        attendeeName: attendeeName,
        ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tickets`,
    });
    
    const success = await sendEmail({
        to: attendeeEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
    });

    if (success) {
      return NextResponse.json({ success: true, message: 'Confirmation email sent.' });
    } else {
      throw new Error('Email provider failed to send email.');
    }

  } catch (error) {
    console.error('Send confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}
