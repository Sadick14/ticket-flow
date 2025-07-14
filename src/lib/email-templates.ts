
// --- Email Template System (Client-Safe) ---

const emailWrapper = (title: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
    .header { background: linear-gradient(135deg, #1e40af, #7c3aed); color: white; padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; color: #374151; line-height: 1.6; }
    .content h2 { color: #1e40af; margin-top: 0; }
    .button { display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 14px; }
    .footer a { color: #1e40af; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>${title}</h1></div>
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
  // Organizer-specific templates (not for admin panel, but same system)
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
