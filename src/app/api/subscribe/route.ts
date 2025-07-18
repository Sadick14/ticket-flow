
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendEmail, renderTemplate } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    // Check if email already exists
    const subscribersRef = collection(db, 'subscribers');
    const q = query(subscribersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json({ message: 'You are already subscribed!' }, { status: 200 });
    }

    // Add new subscriber
    await addDoc(subscribersRef, {
      email,
      subscribedAt: new Date().toISOString(),
    });

    // Send confirmation email
    const confirmationEmail = renderTemplate('simpleAnnouncement', {
        subject: "Welcome to the TicketFlow Newsletter!",
        headline: "You're Subscribed!",
        message: "Thanks for joining our newsletter. You're all set to receive the latest updates on exciting events, new platform features, and special offers."
    });
    
    await sendEmail({
      to: email,
      ...confirmationEmail
    });

    return NextResponse.json({ success: true, message: 'Successfully subscribed.' });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe.' }, { status: 500 });
  }
}
