import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  console.log('Test email endpoint called');
  
  try {
    const { to, subject = 'Test Email from TicketFlow' } = await request.json();
    
    if (!to) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }
    
    console.log(`Sending test email to: ${to}`);
    
    const testEmailContent = {
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af;">TicketFlow Test Email</h2>
          <p>This is a test email to verify that the email service is working correctly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Timestamp: ${new Date().toISOString()}</li>
            <li>Recipient: ${to}</li>
            <li>Environment: ${process.env.NODE_ENV}</li>
          </ul>
          <p>If you received this email, your email service is configured correctly!</p>
          <hr>
          <small style="color: #666;">This is an automated test email from TicketFlow</small>
        </div>
      `,
      text: `TicketFlow Test Email

This is a test email to verify that the email service is working correctly.

Test Details:
- Timestamp: ${new Date().toISOString()}
- Recipient: ${to}
- Environment: ${process.env.NODE_ENV}

If you received this email, your email service is configured correctly!
      `
    };
    
    const result = await sendEmail(testEmailContent);
    
    if (result) {
      console.log('Test email sent successfully');
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        details: { recipient: to, timestamp: new Date().toISOString() }
      });
    } else {
      console.log('Test email failed to send');
      return NextResponse.json({
        success: false,
        message: 'Failed to send test email'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error sending test email',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
