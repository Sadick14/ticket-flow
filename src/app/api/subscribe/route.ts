
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendEmail } from '@/lib/email';

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

    // Send confirmation email (optional)
    await sendEmail({
      to: email,
      subject: 'Welcome to the TicketFlow Newsletter!',
      text: 'Thanks for subscribing! You\'ll now receive the latest updates on events and features from TicketFlow.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2>Welcome to TicketFlow!</h2>
          <p>Thanks for subscribing to our newsletter. You're all set to receive the latest updates on exciting events, new platform features, and special offers.</p>
          <p>Stay tuned!</p>
          <p>Best regards,<br/>The TicketFlow Team</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: 'Successfully subscribed.' });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe.' }, { status: 500 });
  }
}
