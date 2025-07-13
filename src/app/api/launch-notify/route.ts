
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

interface NotificationRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email }: NotificationRequest = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Store email in database (you can implement this based on your data structure)
    // For now, we'll just send a confirmation email

    const confirmationEmailSent = await sendEmail({
      to: email,
      subject: '🚀 You\'re on the list! TicketFlow Launch Notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af, #7c3aed); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px;">🚀 Welcome to TicketFlow!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You're on the VIP launch list</p>
          </div>
          
          <div style="padding: 20px; background: #f8fafc; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e40af; margin-top: 0;">Thanks for your interest! 🎉</h2>
            <p>You're now on our exclusive launch notification list. We'll send you an email the moment TicketFlow goes live!</p>
            
            <h3 style="color: #1e40af;">What to expect:</h3>
            <ul style="color: #64748b;">
              <li>⚡ Lightning-fast event creation</li>
              <li>📊 Real-time analytics and insights</li>
              <li>🎫 Beautiful, customizable tickets</li>
              <li>📧 Automated attendee communications</li>
              <li>💳 Secure payment processing</li>
              <li>📱 Mobile-optimized experience</li>
            </ul>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #64748b; margin: 0;">We're launching very soon! Get ready for the future of event management.</p>
          </div>
          
          <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; color: #94a3b8; font-size: 14px;">
            <p>© 2025 TicketFlow. All rights reserved.</p>
            <p>You're receiving this because you signed up for launch notifications.</p>
          </div>
        </div>
      `,
      text: `
        🚀 Welcome to TicketFlow!
        
        Thanks for your interest! You're now on our exclusive launch notification list.
        
        We'll send you an email the moment TicketFlow goes live with all the amazing features:
        - Lightning-fast event creation
        - Real-time analytics and insights  
        - Beautiful, customizable tickets
        - Automated attendee communications
        - Secure payment processing
        - Mobile-optimized experience
        
        We're launching very soon! Get ready for the future of event management.
        
        © 2025 TicketFlow. All rights reserved.
      `
    });

    // Also send notification to admin (optional)
    if (process.env.SMTP_USER) {
      await sendEmail({
        to: process.env.SMTP_USER,
        subject: '🚀 New Launch Notification Signup',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e40af;">New Launch Notification Signup</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p>Someone just signed up for launch notifications on the countdown page!</p>
          </div>
        `,
        text: `New Launch Notification Signup\n\nEmail: ${email}\nTime: ${new Date().toLocaleString()}\n\nSomeone just signed up for launch notifications!`
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
