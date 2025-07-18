
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendEmail, renderTemplate } from '@/lib/email';
import type { Ticket, Event } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { PaymentCalculator } from '@/lib/payment-config';

interface AddTicketRequest {
  eventId: string;
  attendees: { attendeeName: string; attendeeEmail: string }[];
  price: number;
  bookingCode: string;
  status: 'pending' | 'confirmed';
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
    const { eventId, attendees, price, bookingCode, status }: AddTicketRequest = await request.json();

    if (!eventId || !attendees || attendees.length === 0 || !bookingCode) {
      return NextResponse.json({ error: 'Missing required booking data' }, { status: 400 });
    }
    
    const event = await getEventById(eventId);
    if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
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
        purchaseDate: new Date().toISOString(),
        checkedIn: false,
        status: status,
        bookingCode: bookingCode,
      };
      
      const docRef = await addDoc(ticketsCollection, {
        ...newTicket,
        purchaseDate: serverTimestamp(),
      });

      const finalTicket = { id: docRef.id, ...newTicket };
      newTicketsData.push(finalTicket);

      const eventDate = parseISO(`${event.date}T${event.time}`);
      const totalPrice = price * attendees.length;

      // Send different emails based on ticket status
      if (status === 'confirmed') { // For free events
        try {
          const emailContent = renderTemplate('ticketConfirmation', {
              eventName: event.name,
              eventDate: format(eventDate, 'PPP p'),
              attendeeName: finalTicket.attendeeName,
              ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ticket-flow.up.railway.app'}/my-page`,
          });
          
          await sendEmail({
              to: finalTicket.attendeeEmail,
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text
          });
        } catch (emailError) {
          console.error(`Error sending confirmation email for ${finalTicket.attendeeEmail}:`, emailError);
        }
      } else { // For pending (paid) events
         try {
          const emailContent = renderTemplate('pendingPaymentInstructions', {
              eventName: event.name,
              attendeeName: finalTicket.attendeeName,
              totalPrice: PaymentCalculator.formatCurrency(totalPrice, 'GHS'),
              bookingCode: bookingCode,
              paymentNumber: "0597479994"
          });
          
          await sendEmail({
              to: finalTicket.attendeeEmail,
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text
          });
        } catch (emailError) {
          console.error(`Error sending payment instructions for ${finalTicket.attendeeEmail}:`, emailError);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Booking successful.', tickets: newTicketsData });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket.' }, { status: 500 });
  }
}
