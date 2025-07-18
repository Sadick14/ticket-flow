
// --- Email Template System (Client-Safe) ---

const emailWrapper = (title: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'PT Sans', Arial, sans-serif; margin: 0; padding: 0; background-color: #F0F8FF; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background-color: #237A7A; color: white; padding: 24px; text-align: center; }
    .logo { font-size: 28px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: 1px; }
    .content { padding: 30px; color: #334155; line-height: 1.6; }
    .content h2 { color: #237A7A; margin-top: 0; }
    .button { display: inline-block; background-color: #70A4A4; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
    .footer a { color: #237A7A; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
        <div class="logo">TicketFlow</div>
    </div>
    <div class="content">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} TicketFlow. All rights reserved.</p>
      <p>You're receiving this because you're a part of the TicketFlow community.</p>
    </div>
  </div>
</body>
</html>
`;

export interface EmailTemplate {
  name: string;
  category: 'newsletter' | 'announcement';
  fields: {
    [key: string]: {
      label: string;
      placeholder: string;
      type: 'text' | 'textarea' | 'url';
    }
  };
  generate: (content: Record<string, string>) => { subject: string, html: string, text: string };
}

export const emailTemplates = {
  simpleAnnouncement: {
    name: 'Simple Announcement',
    category: 'announcement',
    fields: {
      subject: { label: 'Subject', placeholder: 'A quick update from TicketFlow', type: 'text' },
      headline: { label: 'Headline', placeholder: 'Important News!', type: 'text' },
      message: { label: 'Message', placeholder: 'Here\'s what you need to know...', type: 'textarea' },
    },
    generate: (content) => {
      const { subject, headline, message } = content;
      const html = emailWrapper(headline, `<h2>${headline}</h2><p>${message.replace(/\n/g, '<br>')}</p>`);
      const text = `${headline}\n\n${message}`;
      return { subject, html, text };
    }
  },
  callToAction: {
    name: 'Call to Action',
    category: 'announcement',
    fields: {
      subject: { label: 'Subject', placeholder: 'Don\'t Miss Out!', type: 'text' },
      headline: { label: 'Headline', placeholder: 'An Exciting Opportunity', type: 'text' },
      message: { label: 'Message', placeholder: 'We have something special for you...', type: 'textarea' },
      buttonText: { label: 'Button Text', placeholder: 'Learn More', type: 'text' },
      buttonUrl: { label: 'Button URL', placeholder: 'https://example.com/link', type: 'url' },
    },
    generate: (content) => {
      const { subject, headline, message, buttonText, buttonUrl } = content;
      const html = emailWrapper(headline, `<h2>${headline}</h2><p>${message.replace(/\n/g, '<br>')}</p><a href="${buttonUrl}" class="button">${buttonText}</a>`);
      const text = `${headline}\n\n${message}\n\n${buttonText}: ${buttonUrl}`;
      return { subject, html, text };
    }
  },
  featureNewsletter: {
    name: 'Feature Newsletter',
    category: 'newsletter',
    fields: {
      subject: { label: 'Subject', placeholder: 'This Month at TicketFlow', type: 'text' },
      headline: { label: 'Main Headline', placeholder: 'New Features to Explore', type: 'text' },
      intro: { label: 'Introduction', placeholder: 'We\'ve been busy building things...', type: 'textarea' },
      feature1Title: { label: 'Feature 1 Title', placeholder: 'Awesome New Feature', type: 'text' },
      feature1Desc: { label: 'Feature 1 Description', placeholder: 'Details about the feature...', type: 'textarea' },
      buttonText: { label: 'Button Text', placeholder: 'Explore Now', type: 'text' },
      buttonUrl: { label: 'Button URL', placeholder: 'https://example.com/features', type: 'url' },
    },
    generate: (content) => {
       const { subject, headline, intro, feature1Title, feature1Desc, buttonText, buttonUrl } = content;
      const html = emailWrapper('TicketFlow Newsletter', `
        <h2>${headline}</h2>
        <p>${intro.replace(/\n/g, '<br>')}</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <h3>${feature1Title}</h3>
        <p>${feature1Desc.replace(/\n/g, '<br>')}</p>
        <a href="${buttonUrl}" class="button">${buttonText}</a>
      `);
      const text = `${headline}\n\n${intro}\n\n${feature1Title}\n${feature1Desc}\n\n${buttonText}: ${buttonUrl}`;
      return { subject, html, text };
    }
  },
  // --- Internal System Emails ---
  emailVerification: {
    name: "Email Verification",
    category: "announcement",
    fields: {
      attendeeName: { label: 'Attendee Name', placeholder: '', type: 'text' },
      otpCode: { label: 'OTP Code', placeholder: '', type: 'text' },
    },
    generate: (content) => {
      const { attendeeName, otpCode } = content;
      const subject = `Your TicketFlow Verification Code`;
      const html = emailWrapper('Verify Your Email', `
        <h2>Hello ${attendeeName},</h2>
        <p>To access your tickets, please use the following verification code:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0; text-align: center;">${otpCode}</p>
        <p>This code is valid for a short time. If you didn't request this, you can safely ignore this email.</p>
      `);
      const text = `Hello ${attendeeName},\n\nYour verification code is: ${otpCode}\n\nThis code is valid for a short time.`;
      return { subject, html, text };
    },
  },
  ticketConfirmation: {
    name: 'Ticket Confirmation',
    category: 'announcement', // Not selectable in admin
    fields: {
      eventName: { label: 'Event Name', placeholder: '', type: 'text'},
      eventDate: { label: 'Event Date', placeholder: '', type: 'text'},
      attendeeName: { label: 'Attendee Name', placeholder: '', type: 'text'},
      ticketUrl: { label: 'Ticket URL', placeholder: '', type: 'url'},
    },
    generate: (content) => {
        const { eventName, eventDate, attendeeName, ticketUrl } = content;
        const subject = `✅ Your Ticket for ${eventName} is Confirmed!`;
        const html = emailWrapper('Ticket Confirmed!', `
            <h2>Congratulations, ${attendeeName}!</h2>
            <p>Your ticket purchase for <strong>${eventName}</strong> is complete. We can't wait to see you!</p>
            <p><strong>Event Date:</strong> ${eventDate}</p>
            <p>You can view and manage your tickets at any time by clicking the button below.</p>
            <a href="${ticketUrl}" class="button">View My Tickets</a>
        `);
        const text = `Congratulations, ${attendeeName}!\n\nYour ticket for ${eventName} on ${eventDate} is confirmed.\n\nView your tickets here: ${ticketUrl}`;
        return { subject, html, text };
    }
  },
  pendingPaymentInstructions: {
    name: 'Pending Payment Instructions',
    category: 'announcement',
    fields: {
      eventName: { label: 'Event Name', type: 'text', placeholder: '' },
      attendeeName: { label: 'Attendee Name', type: 'text', placeholder: '' },
      totalPrice: { label: 'Total Price', type: 'text', placeholder: '' },
      bookingCode: { label: 'Booking Code', type: 'text', placeholder: '' },
      paymentNumber: { label: 'Payment Number', type: 'text', placeholder: '' },
    },
    generate: (content) => {
      const { eventName, attendeeName, totalPrice, bookingCode, paymentNumber } = content;
      const subject = `Action Required: Complete your payment for ${eventName}`;
      const html = emailWrapper('Payment Required', `
        <h2>Hi ${attendeeName},</h2>
        <p>Thank you for booking your spot for <strong>${eventName}</strong>! Your reservation is pending payment.</p>
        <h3>Payment Instructions:</h3>
        <ol>
          <li>Send <strong>${totalPrice}</strong> via Mobile Money to: <strong>${paymentNumber}</strong>.</li>
          <li>Use the following booking code as your payment reference: <strong style="font-size: 1.2em; color: #237A7A;">${bookingCode}</strong></li>
        </ol>
        <p>Once we confirm your payment, we will send your final ticket confirmation. Your booking is held for 24 hours.</p>
        <p>Thank you!</p>
      `);
      const text = `Hi ${attendeeName},\n\nYour booking for ${eventName} is pending. Please complete your payment of ${totalPrice} to ${paymentNumber} using the reference code: ${bookingCode}.\n\nThank you!`;
      return { subject, html, text };
    },
  },
  eventReminder: {
    name: 'Event Reminder',
    category: 'announcement', // Not selectable in admin
    fields: {
      eventName: { label: 'Event Name', placeholder: '', type: 'text'},
      eventDate: { label: 'Event Date', placeholder: '', type: 'text'},
      eventLocation: { label: 'Event Location', placeholder: '', type: 'text'},
      optionalMessage: { label: 'Optional Message', placeholder: '', type: 'textarea'},
    },
    generate: (content) => {
        const { eventName, eventDate, eventLocation, optionalMessage } = content;
        const subject = `📅 Reminder: ${eventName} is almost here!`;
        const html = emailWrapper('Event Reminder', `
            <h2>Don't Forget!</h2>
            <p>This is a friendly reminder that <strong>${eventName}</strong> is happening soon.</p>
            <p><strong>Date:</strong> ${eventDate}<br><strong>Location:</strong> ${eventLocation}</p>
            ${optionalMessage ? `<p><strong>A note from the organizer:</strong><br>${optionalMessage.replace(/\n/g, '<br>')}</p>` : ''}
            <p>We're excited to see you there!</p>
        `);
        const text = `Don't Forget! Reminder for ${eventName}.\nDate: ${eventDate}\nLocation: ${eventLocation}\n${optionalMessage ? `Note: ${optionalMessage}` : ''}`;
        return { subject, html, text };
    },
  },
  eventUpdate: {
    name: 'Event Update',
    category: 'announcement', // Not selectable in admin
    fields: {
        eventName: { label: 'Event Name', placeholder: '', type: 'text' },
        updateMessage: { label: 'Update Message', placeholder: '', type: 'textarea' },
    },
    generate: (content) => {
        const { eventName, updateMessage } = content;
        const subject = `📢 Update for ${eventName}`;
        const html = emailWrapper('Event Update', `
            <h2>An important update regarding ${eventName}:</h2>
            <p>${updateMessage.replace(/\n/g, '<br>')}</p>
        `);
        const text = `Update for ${eventName}:\n\n${updateMessage}`;
        return { subject, html, text };
    }
  }
} as const;

export type TemplateId = keyof typeof emailTemplates;

export function renderTemplate(templateId: TemplateId, content: Record<string, string>) {
  const template = emailTemplates[templateId];
  if (!template) {
    throw new Error('Invalid template ID');
  }
  return template.generate(content);
}
