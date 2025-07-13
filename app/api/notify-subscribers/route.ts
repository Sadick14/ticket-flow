
import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendMail } from '@/lib/email';
import type { LaunchSubscriber } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  // Simple secret key authentication. In a real app, use a more secure method.
  if (key !== 'your-super-secret-key') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subscribersCollection = collection(db, 'launch_subscribers');
    const subscriberSnapshot = await getDocs(subscribersCollection);
    const subscribers = subscriberSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as LaunchSubscriber)
    );

    if (subscribers.length === 0) {
      return NextResponse.json(
        { message: 'No subscribers to notify.' },
        { status: 200 }
      );
    }

    const emailSubject = "🎉 TicketFlow is LIVE!";
    const emailHtml = `
      <h1>We're Live!</h1>
      <p>The wait is over! TicketFlow is now live and ready for you.</p>
      <p>Start creating and discovering amazing events today.</p>
      <a href="${new URL(request.url).origin}">Go to TicketFlow</a>
      <p>Thank you for your support!</p>
    `;

    // Send emails to all subscribers
    const emailPromises = subscribers.map((subscriber) =>
      sendMail({
        to: subscriber.email,
        subject: emailSubject,
        html: emailHtml,
      }).catch((error) => {
        // Log errors but don't stop the whole process
        console.error(`Failed to send email to ${subscriber.email}:`, error);
        return null; // Indicate failure
      })
    );
    
    const results = await Promise.all(emailPromises);
    const sentCount = results.filter(r => r !== null).length;

    return NextResponse.json({
      message: 'Notifications sent successfully.',
      totalSubscribers: subscribers.length,
      sentCount: sentCount,
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { message: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
