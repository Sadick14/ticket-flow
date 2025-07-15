
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates, renderTemplate } from '@/lib/email';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, Ticket } from '@/lib/types';
import type { TemplateId } from '@/lib/email-templates';

interface EmailRequest {
  type: 'event-reminder' | 'event-update' | 'template';
  recipients: string[];
  recipientType: 'all-users' | 'event-creators' | 'event-attendees' | 'launch-subscribers' | 'custom';
  subject?: string;
  message?: string;
  eventId?: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  senderRole: 'admin' | 'organizer';

  // For template-based emails
  templateId?: TemplateId;
  templateContent?: Record<string, string>;
}

async function getRecipientEmails(type: string, eventId?: string): Promise<string[]> {
    let emails: string[] = [];
    try {
        switch(type) {
            case 'all-users':
                const usersSnapshot = await getDocs(collection(db, 'users'));
                emails = usersSnapshot.docs.map(doc => (doc.data() as UserProfile).email).filter((email): email is string => !!email);
                break;
            case 'event-creators':
                const eventsSnapshot = await getDocs(collection(db, 'events'));
                const creatorIds = [...new Set(eventsSnapshot.docs.map(doc => doc.data().creatorId))];
                if (creatorIds.length > 0) {
                     const creatorsQuery = query(collection(db, 'users'), where('uid', 'in', creatorIds));
                     const creatorsSnapshot = await getDocs(creatorsQuery);
                     emails = creatorsSnapshot.docs.map(doc => (doc.data() as UserProfile).email).filter((email): email is string => !!email);
                }
                break;
            case 'event-attendees':
                if (eventId) {
                    const ticketsQuery = query(collection(db, 'tickets'), where('eventId', '==', eventId));
                    const ticketsSnapshot = await getDocs(ticketsQuery);
                    const attendeeEmails = [...new Set(ticketsSnapshot.docs.map(doc => (doc.data() as Ticket).attendeeEmail))];
                    emails = attendeeEmails;
                }
                break;
            case 'launch-subscribers':
                const subscribersSnapshot = await getDocs(collection(db, 'launch_subscribers'));
                emails = subscribersSnapshot.docs.map(doc => doc.data().email).filter((email): email is string => !!email);
                break;
        }
    } catch(e) {
        console.error("Error fetching emails for type:", type, e);
    }
    return emails;
}


export async function POST(request: NextRequest) {
  console.log('POST /api/send-email called');
  
  try {
    const body: EmailRequest = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { 
        type, 
        recipientType, 
        eventId, 
        recipients: customRecipients, 
        subject, 
        message, 
        eventTitle, 
        eventDate, 
        eventLocation, 
        senderRole,
        templateId,
        templateContent 
    } = body;

    let recipients: string[] = [];

    if (recipientType === 'custom') {
        recipients = customRecipients;
        console.log('Using custom recipients:', recipients);
    } else {
        console.log('Fetching recipients for type:', recipientType);
        recipients = await getRecipientEmails(recipientType, eventId);
        console.log('Found recipients:', recipients.length);
    }
    
    if (recipients.length === 0) {
      console.log('No recipients found');
      return NextResponse.json({ error: 'No recipients found for the selected group.' }, { status: 400 });
    }

    if (senderRole === 'organizer' && !['event-reminder', 'event-update'].includes(type)) {
      return NextResponse.json({ error: 'Organizers can only send event reminders and updates' }, { status: 403 });
    }

    let emailToSend;

    console.log('Processing email type:', type);
    
    if (type === 'template' && templateId && templateContent) {
        console.log('Using template:', templateId, 'with content:', templateContent);
        const template = emailTemplates[templateId];
        if (!template) {
            console.log('Invalid template ID:', templateId);
            return NextResponse.json({ error: 'Invalid email template' }, { status: 400 });
        }
        emailToSend = renderTemplate(templateId, templateContent);
        console.log('Generated email from template:', emailToSend.subject);
    } else if (type === 'event-reminder' || type === 'event-update') {
        if (!eventTitle) {
            console.log('Missing event title for event email');
            return NextResponse.json({ error: 'Event details required' }, { status: 400 });
        }
        console.log('Generating event email for:', eventTitle);
        emailToSend = type === 'event-reminder' 
            ? renderTemplate('eventReminder', { eventName: eventTitle, eventDate: eventDate || '', eventLocation: eventLocation || '', optionalMessage: message || '' })
            : renderTemplate('eventUpdate', { eventName: eventTitle, updateMessage: message || ''});
        console.log('Generated event email:', emailToSend.subject);
    } else {
        console.log('Invalid email type or missing data:', { type, templateId });
        return NextResponse.json({ error: 'Invalid email type or missing data' }, { status: 400 });
    }

    const batchSize = 50;
    let successCount = 0;
    let failureCount = 0;

    console.log(`Starting to send emails to ${recipients.length} recipients in batches of ${batchSize}`);

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}: ${batch.length} emails`);
      
      const emailPromises = batch.map(email =>
        sendEmail({
          to: email,
          subject: emailToSend.subject,
          html: emailToSend.html,
          text: emailToSend.text,
        })
      );
      const results = await Promise.all(emailPromises);
      const batchSuccess = results.filter(r => r).length;
      const batchFailure = results.filter(r => !r).length;
      
      successCount += batchSuccess;
      failureCount += batchFailure;
      
      console.log(`Batch completed: ${batchSuccess} successful, ${batchFailure} failed`);
      
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Emails sent.`,
      details: {
        total: recipients.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const eventId = searchParams.get('eventId');

        if (!type) {
             return NextResponse.json({ error: 'Recipient type is required' }, { status: 400 });
        }

        const recipients = await getRecipientEmails(type, eventId || undefined);

        return NextResponse.json({ recipients });
    } catch (error) {
        console.error('Error fetching recipients:', error);
        return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 });
    }
}
