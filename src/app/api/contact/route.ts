
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
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">New Contact Form Message</h2>
        <p>You have a new message from <strong>${name} (${email})</strong>.</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>Please log in to the admin dashboard to view the full message and reply.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/contact-messages" style="display: inline-block; padding: 10px 20px; color: white; background-color: #1e40af; text-decoration: none; border-radius: 5px;">
          View Message
        </a>
      </div>
    `;
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `[New TicketFlow Message] - ${subject}`,
      html: adminEmailHtml,
      text: `New message from ${name} (${email}). Subject: ${subject}. View and reply in the admin dashboard.`
    } as any);

    // 3. Send confirmation email to user
    await sendEmail({
      to: email,
      subject: "We've received your message!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e40af;">Thank you for contacting us!</h2>
            <p>Hi ${name},</p>
            <p>This is an automated confirmation that we have received your message. Our team will get back to you as soon as possible, typically within 24 hours.</p>
            <p><strong>Your submission summary:</strong></p>
            <blockquote style="border-left: 4px solid #e2e8f0; padding-left: 15px; margin-left: 0;">
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong> ${message.substring(0, 100)}...</p>
            </blockquote>
            <p>Best regards,<br/>The TicketFlow Team</p>
        </div>
      `,
      text: `Hi ${name},\n\nThank you for contacting us. We have received your message and will get back to you soon.\n\nBest,\nThe TicketFlow Team`
    })

    return NextResponse.json({ success: true, message: "Your message has been sent successfully." });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
