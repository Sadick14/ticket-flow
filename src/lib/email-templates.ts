
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
    body { font-family: 'PT Sans', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background-color: #f76610; color: white; padding: 24px; text-align: center; }
    .logo { font-size: 28px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: 1px; }
    .content { padding: 30px; color: #334155; line-height: 1.6; }
    .content h2 { color: #f76610; margin-top: 0; }
    .button { display: inline-block; background-color: #f76610; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
    .footer a { color: #f76610; text-decoration: none; }
    .featured-image { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px; }
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
  category: 'newsletter' | 'announcement' | 'system';
  fields: {
    [key: string]: {
      label: string;
      placeholder: string;
      defaultValue: string;
      type: 'text' | 'textarea' | 'url';
    }
  };
  generate: (content: Record<string, any>) => { subject: string, html: string, text: string };
}

export const emailTemplates = {
  simpleAnnouncement: {
    name: 'Simple Announcement',
    category: 'announcement',
    fields: {
      subject: { label: 'Subject', placeholder: 'A quick update from TicketFlow', defaultValue: 'Important Update from TicketFlow', type: 'text' },
      headline: { label: 'Headline', placeholder: 'Important News!', defaultValue: 'An Update You Won\'t Want to Miss', type: 'text' },
      message: { label: 'Message', placeholder: 'Here\'s what you need to know...', defaultValue: 'Hi everyone,\n\nWe wanted to share a quick but important update regarding our platform. [Explain the update here].\n\nThanks for being a part of our community!\n\nBest,\nThe TicketFlow Team', type: 'textarea' },
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
      subject: { label: 'Subject', placeholder: 'Don\'t Miss Out!', defaultValue: 'A Special Invitation for You', type: 'text' },
      headline: { label: 'Headline', placeholder: 'An Exciting Opportunity', defaultValue: 'You\'re Invited!', type: 'text' },
      message: { label: 'Message', placeholder: 'We have something special for you...', defaultValue: 'We\'ve got something special just for our community members! We\'re launching a new [feature/event] and we want you to be the first to experience it.\n\nClick the button below to learn more and get involved.', type: 'textarea' },
      buttonText: { label: 'Button Text', placeholder: 'Learn More', defaultValue: 'Learn More', type: 'text' },
      buttonUrl: { label: 'Button URL', placeholder: 'https://ticket-flow.up.railway.app', defaultValue: 'https://ticket-flow.up.railway.app', type: 'url' },
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
      subject: { label: 'Subject', placeholder: 'This Month at TicketFlow', defaultValue: 'What\'s New at TicketFlow - [Month] Edition', type: 'text' },
      headline: { label: 'Main Headline', placeholder: 'New Features to Explore', defaultValue: 'This Month\'s Top New Features', type: 'text' },
      intro: { label: 'Introduction', placeholder: 'We\'ve been busy building things...', defaultValue: 'Hello everyone,\n\nWe\'ve been working hard behind the scenes to bring you some powerful new tools to make your events even more successful. Here\'s what\'s new this month:', type: 'textarea' },
    },
    generate: (content) => {
      const { subject, headline, intro, features } = content;
      
      let featuresHtml = '';
      let featuresText = '';

      if (Array.isArray(features)) {
        features.forEach((feature: any) => {
          featuresHtml += `
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            ${feature.imageUrl ? `<img src="${feature.imageUrl}" alt="${feature.title}" class="featured-image">` : ''}
            <h3>${feature.title}</h3>
            <p>${feature.description.replace(/\n/g, '<br>')}</p>
            ${feature.buttonUrl && feature.buttonText ? `<a href="${feature.buttonUrl}" class="button">${feature.buttonText}</a>` : ''}
          `;
          featuresText += `\n\n---\n\n${feature.title}\n${feature.description}\n${feature.buttonUrl && feature.buttonText ? `${feature.buttonText}: ${feature.buttonUrl}` : ''}`;
        });
      }

      const html = emailWrapper(headline, `
        <h2>${headline}</h2>
        <p>${intro.replace(/\n/g, '<br>')}</p>
        ${featuresHtml}
      `);
      const text = `${headline}\n\n${intro}${featuresText}`;
      return { subject, html, text };
    }
  },
  newContentAnnouncement: {
    name: "New Content Announcement",
    category: "announcement",
    fields: {
      subject: { label: "Subject", placeholder: "New Event: Event Name", defaultValue: "", type: "text" },
      headline: { label: "Headline", placeholder: "Check out this new event!", defaultValue: "", type: "text" },
      contentTitle: { label: "Content Title", placeholder: "Event or Article Title", defaultValue: "", type: "text" },
      imageUrl: { label: "Image URL", placeholder: "https://...", defaultValue: "", type: "url" },
      description: { label: "Short Description", placeholder: "A brief summary...", defaultValue: "", type: "textarea" },
      buttonText: { label: "Button Text", placeholder: "View Event", defaultValue: "", type: "text" },
      buttonUrl: { label: "Button URL", placeholder: "https://...", defaultValue: "", type: "url" },
    },
    generate: (content) => {
      const { subject, headline, contentTitle, imageUrl, description, buttonText, buttonUrl } = content;
      const html = emailWrapper(subject, `
        <h2>${headline}</h2>
        ${imageUrl ? `<img src="${imageUrl}" alt="${contentTitle}" class="featured-image">` : ''}
        <h3>${contentTitle}</h3>
        <p>${description.replace(/\n/g, '<br>')}</p>
        <a href="${buttonUrl}" class="button">${buttonText}</a>
      `);
      const text = `${headline}\n\n${contentTitle}\n\n${description}\n\n${buttonText}: ${buttonUrl}`;
      return { subject, html, text };
    },
  },
  // --- Internal System Emails ---
  emailVerification: {
    name: "Email Verification",
    category: "system",
    fields: {
      attendeeName: { label: 'Attendee Name', placeholder: '', defaultValue: '', type: 'text' },
      otpCode: { label: 'OTP Code', placeholder: '', defaultValue: '', type: 'text' },
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
    category: 'system',
    fields: {
      eventName: { label: 'Event Name', placeholder: '', defaultValue: '', type: 'text'},
      eventDate: { label: 'Event Date', placeholder: '', defaultValue: '', type: 'text'},
      attendeeName: { label: 'Attendee Name', placeholder: '', defaultValue: '', type: 'text'},
      ticketUrl: { label: 'Ticket URL', placeholder: '', defaultValue: '', type: 'url'},
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
    category: 'system',
    fields: {
      eventName: { label: 'Event Name', type: 'text', placeholder: '', defaultValue: '' },
      attendeeName: { label: 'Attendee Name', type: 'text', placeholder: '', defaultValue: '' },
      totalPrice: { label: 'Total Price', type: 'text', placeholder: '', defaultValue: '' },
      bookingCode: { label: 'Booking Code', type: 'text', placeholder: '', defaultValue: '' },
      paymentNumber: { label: 'Payment Number', type: 'text', placeholder: '', defaultValue: '' },
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
          <li>Use the following booking code as your payment reference: <strong style="font-size: 1.2em; color: #f76610;">${bookingCode}</strong></li>
        </ol>
        <p>Once we confirm your payment, we will send your final ticket confirmation. Your booking is held for 24 hours.</p>
        <p>Thank you!</p>
      `);
      const text = `Hi ${attendeeName},\n\nYour booking for ${eventName} is pending. Please complete your payment of ${totalPrice} to ${paymentNumber} using the reference code: ${bookingCode}.\n\nThank you!`;
      return { subject, html, text };
    },
  },
  subscriptionApproved: {
    name: 'Subscription Approved',
    category: 'system',
    fields: {
      userName: { label: 'User Name', type: 'text', placeholder: '', defaultValue: '' },
      planName: { label: 'Plan Name', type: 'text', placeholder: '', defaultValue: '' },
      planPrice: { label: 'Plan Price', type: 'text', placeholder: '', defaultValue: '' },
      planBenefits: { label: 'Plan Benefits', type: 'textarea', placeholder: '', defaultValue: '' },
    },
    generate: (content) => {
      const { userName, planName, planPrice, planBenefits } = content;
      const subject = `✅ Your TicketFlow ${planName} Plan is Active!`;
      const html = emailWrapper('Subscription Active!', `
        <h2>Welcome to the ${planName} Plan, ${userName}!</h2>
        <p>Your payment of <strong>${planPrice}</strong> has been confirmed, and your subscription is now active. You have unlocked new features to make your events even more successful.</p>
        <h3>Your ${planName} Plan Benefits:</h3>
        <ul>
          ${planBenefits.split('\n').map(b => `<li>${b}</li>`).join('')}
        </ul>
        <p>You can start using these new features right away in your dashboard.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
      `);
      const text = `Welcome to the ${planName} Plan, ${userName}!\n\nYour subscription is now active. Here are your benefits:\n${planBenefits}\n\nGo to your dashboard to start using them: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
      return { subject, html, text };
    },
  },
  eventReminder: {
    name: 'Event Reminder',
    category: 'system',
    fields: {
      eventName: { label: 'Event Name', placeholder: '', defaultValue: '', type: 'text'},
      eventDate: { label: 'Event Date', placeholder: '', defaultValue: '', type: 'text'},
      eventLocation: { label: 'Event Location', placeholder: '', defaultValue: '', type: 'text'},
      optionalMessage: { label: 'Optional Message', placeholder: '', defaultValue: '', type: 'textarea'},
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
    category: 'system',
    fields: {
        eventName: { label: 'Event Name', placeholder: '', defaultValue: '', type: 'text' },
        updateMessage: { label: 'Update Message', placeholder: '', defaultValue: '', type: 'textarea' },
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

export function renderTemplate(templateId: TemplateId, content: Record<string, any>) {
  const template = emailTemplates[templateId];
  if (!template) {
    throw new Error('Invalid template ID');
  }
  return template.generate(content);
}
