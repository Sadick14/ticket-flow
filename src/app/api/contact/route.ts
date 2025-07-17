
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ContactSubmission } from '@/lib/types';

interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

const ADMIN_EMAIL = process.env.SMTP_USER || 'issakasaddick14@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormRequest = await request.json();
    const { name, email, subject, category, message } = data;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Save submission to Firestore
    const submissionData: Omit<ContactSubmission, 'id'> = {
        name,
        email,
        subject,
        category,
        message,
        status: 'new',
        submittedAt: new Date().toISOString() // Placeholder, will be replaced by server timestamp
    };
    await addDoc(collection(db, 'contact_submissions'), {
      ...submissionData,
      submittedAt: serverTimestamp()
    });
    
    // 2. Send notification email to admin
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `[New TicketFlow Message] - ${subject}`,
      html: `<p>New message from ${name} (${email}). Subject: ${subject}. View and reply in the admin dashboard.</p>`,
      text: `New message from ${name} (${email}). Subject: ${subject}. View and reply in the admin dashboard.`
    });

    // 3. Send confirmation email to user
    await sendEmail({
      to: email,
      subject: "We've received your message!",
      html: `<p>Hi ${name},</p><p>This is an automated confirmation that we have received your message. Our team will get back to you as soon as possible.</p>`,
      text: `Hi ${name},\n\nThank you for contacting us. We have received your message and will get back to you soon.`
    })

    return NextResponse.json({ success: true, message: "Your message has been sent successfully." });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
