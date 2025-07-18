
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendEmail } from '@/lib/email';
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

    const launchEmail = {
      subject: "🚀 We're Live! TicketFlow is Here!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af, #7c3aed); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px;">🚀 TicketFlow is LIVE!</h1>
          </div>
          <div style="padding: 20px; background: #f8fafc; border-radius: 8px;">
            <p>Hey there,</p>
            <p>The wait is over! TicketFlow, the event management platform you've been waiting for, is now live and ready for you.</p>
            <p>Start creating amazing events or find your next experience today.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ticket-flow.up.railway.app'}/home" style="background-color: #1e40af; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Explore TicketFlow
              </a>
            </div>
            <p>Thanks for being one of our first supporters!</p>
            <p>Best,<br/>The TicketFlow Team</p>
          </div>
        </div>
      `,
      text: "The wait is over! TicketFlow is now live. Explore at our website. Thanks for being a supporter!",
    };
    
    // In a real app, you would use a bulk email service (e.g., SendGrid, Mailgun)
    // to handle this more efficiently and avoid hitting rate limits.
    // For this demo, we'll send them one by one.
    let sentCount = 0;
    for (const subscriber of subscribers) {
      const success = await sendEmail({ ...launchEmail, to: subscriber.email });
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
