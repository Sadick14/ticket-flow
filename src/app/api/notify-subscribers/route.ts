
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendEmail, renderTemplate } from '@/lib/email';
import type { LaunchSubscriber } from '@/lib/types';

export async function GET(request: NextRequest) {
  // Simple secret key authentication for this demo.
  // In a production app, use a more secure method like a signed JWT.
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('key');
  if (secret !== 'your-super-secret-key') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subscribersQuery = query(collection(db, 'launch_subscribers'));
    const querySnapshot = await getDocs(subscribersQuery);
    const subscribers = querySnapshot.docs.map(doc => doc.data() as LaunchSubscriber);

    if (subscribers.length === 0) {
      return NextResponse.json({ sentCount: 0, message: 'No subscribers to notify.' });
    }

    const emailToSend = renderTemplate('callToAction', {
        subject: "🚀 We're Live! TicketFlow is Here!",
        headline: "The Wait is Over!",
        message: "TicketFlow, the event management platform you've been waiting for, is now live and ready for you. Start creating amazing events or find your next experience today. Thanks for being one of our first supporters!",
        buttonText: "Explore TicketFlow",
        buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ticket-flow.up.railway.app'}/home`
    });
    
    // In a real app, you would use a bulk email service (e.g., SendGrid, Mailgun)
    // to handle this more efficiently and avoid hitting rate limits.
    // For this demo, we'll send them one by one.
    let sentCount = 0;
    for (const subscriber of subscribers) {
      const success = await sendEmail({ ...emailToSend, to: subscriber.email });
      if (success) {
        sentCount++;
      }
      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 200)); 
    }

    return NextResponse.json({ sentCount });
  } catch (error) {
    console.error('Failed to notify subscribers:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
