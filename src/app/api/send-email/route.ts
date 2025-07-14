import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email';
import { auth } from '@/lib/firebase';

interface EmailRequest {
  type: 'event-reminder' | 'event-update' | 'newsletter' | 'announcement';
  recipients: string[];
  subject?: string;
  message: string;
  eventId?: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  senderRole: 'admin' | 'organizer';
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { type, recipients, subject, message, eventTitle, eventDate, eventLocation, senderRole } = body;

    // Validate required fields
    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'Recipients are required' }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Role-based validation
    if (senderRole === 'organizer' && !['event-reminder', 'event-update'].includes(type)) {
      return NextResponse.json({ error: 'Organizers can only send event reminders and updates' }, { status: 403 });
    }

    // Generate email template based on type
    let emailTemplate;
    
    switch (type) {
      case 'event-reminder':
        if (!eventTitle || !eventDate || !eventLocation) {
          return NextResponse.json({ error: 'Event details are required for reminders' }, { status: 400 });
        }
        emailTemplate = emailTemplates.eventReminder(eventTitle, eventDate, eventLocation);
        break;
        
      case 'event-update':
        if (!eventTitle) {
          return NextResponse.json({ error: 'Event title is required for updates' }, { status: 400 });
        }
        emailTemplate = emailTemplates.eventUpdate(eventTitle, message);
        break;
        
      case 'newsletter':
        if (!subject) {
          return NextResponse.json({ error: 'Subject is required for newsletters' }, { status: 400 });
        }
        emailTemplate = emailTemplates.newsletter(subject, message);
        break;
        
      case 'announcement':
        if (!subject) {
          return NextResponse.json({ error: 'Subject is required for announcements' }, { status: 400 });
        }
        emailTemplate = emailTemplates.announcement(subject, message);
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    // Send emails in batches to avoid overwhelming the SMTP server
    const batchSize = 50;
    const batches: string[][] = [];
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    let successCount = 0;
    let failureCount = 0;

    if (!emailTemplate) {
      return NextResponse.json({ error: 'Email template could not be generated' }, { status: 500 });
    }

    for (const batch of batches) {
      const emailPromises = batch.map(async (email) => {
        try {
          const success = await sendEmail({
            to: email,
            subject: emailTemplate.subject ?? subject ?? '',
            html: emailTemplate.html ?? message ?? '',
            text: emailTemplate.text ?? message ?? '',
          });
          return success ? 'success' : 'failure';
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          return 'failure';
        }
      });

      const results = await Promise.all(emailPromises);
      successCount += results.filter(r => r === 'success').length;
      failureCount += results.filter(r => r === 'failure').length;
      
      // Add a small delay between batches to be respectful to Gmail's rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Emails sent successfully`,
      details: {
        total: recipients.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch recipient lists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const eventId = searchParams.get('eventId');

    let recipients: string[] = [];

    switch (type) {
      case 'event-attendees':
        if (eventId) {
          // TODO: Implement fetching event attendees from your database
          // recipients = await getEventAttendeeEmails(eventId);
          recipients = []; // Placeholder
        }
        break;
        
      case 'all-users':
        // TODO: Implement fetching all user emails from your database
        // recipients = await getAllUserEmails();
        recipients = []; // Placeholder
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid recipient type' }, { status: 400 });
    }

    return NextResponse.json({ recipients });

  } catch (error) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipients' },
      { status: 500 }
    );
  }
}
