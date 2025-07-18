
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { useAppContext } from '@/context/app-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NotificationRequest {
  email: string;
  name?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, name }: NotificationRequest = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }
    
    // The addSubscriber function in the context will handle duplicate checks and adding to Firestore
    // This is a placeholder for where you might integrate with a context if this API was part of the main app logic.
    // For now, we'll do it directly.
    await addDoc(collection(db, 'launch_subscribers'), {
        email,
        name: name || '',
        subscribedAt: serverTimestamp(),
    });


    // Also send notification to admin (optional)
    if (process.env.SMTP_USER) {
      await sendEmail({
        to: process.env.SMTP_USER,
        subject: '🚀 New Launch Notification Signup',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #f76610;">New Launch Notification Signup</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Name:</strong> ${name || 'N/A'}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p>Someone just signed up for launch notifications on the countdown page!</p>
          </div>
        `,
        text: `New Launch Notification Signup\n\nEmail: ${email}\nName: ${name || 'N/A'}\nTime: ${new Date().toLocaleString()}\n\nSomeone just signed up for launch notifications!`
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to launch notifications!' 
    });

  } catch (error) {
    console.error('Launch notification signup error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to notifications' },
      { status: 500 }
    );
  }
}
