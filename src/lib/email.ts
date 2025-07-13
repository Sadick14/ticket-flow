import nodemailer from 'nodemailer';

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Gmail App Password
    },
  });
};

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: options.from || process.env.FROM_EMAIL || 'noreply@ticketflow.com',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Email templates
export const emailTemplates = {
  eventReminder: (eventTitle: string, eventDate: string, eventLocation: string): EmailTemplate => ({
    subject: `Reminder: ${eventTitle} is coming up!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Event Reminder</h2>
        <p>Hi there!</p>
        <p>This is a friendly reminder that <strong>${eventTitle}</strong> is coming up soon.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Event Details:</h3>
          <p><strong>Event:</strong> ${eventTitle}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
        </div>
        <p>We can't wait to see you there!</p>
        <p>Best regards,<br>The TicketFlow Team</p>
      </div>
    `,
    text: `Event Reminder: ${eventTitle} is coming up on ${eventDate} at ${eventLocation}. We can't wait to see you there!`
  }),

  eventUpdate: (eventTitle: string, updateMessage: string): EmailTemplate => ({
    subject: `Important Update: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Important Event Update</h2>
        <p>Hi there!</p>
        <p>We have an important update regarding <strong>${eventTitle}</strong>:</p>
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
          ${updateMessage}
        </div>
        <p>Thank you for your understanding.</p>
        <p>Best regards,<br>The Event Organizer</p>
      </div>
    `,
    text: `Important Update for ${eventTitle}: ${updateMessage}`
  }),

  newsletter: (subject: string, content: string): EmailTemplate => ({
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">TicketFlow Newsletter</h1>
        </div>
        <div style="padding: 20px;">
          ${content}
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
          <p>You're receiving this because you're a valued member of the TicketFlow community.</p>
          <p>© 2025 TicketFlow. All rights reserved.</p>
        </div>
      </div>
    `,
    text: content.replace(/<[^>]*>/g, '')
  }),

  announcement: (title: string, message: string): EmailTemplate => ({
    subject: `📢 ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">📢 ${title}</h1>
        </div>
        <div style="padding: 20px;">
          ${message}
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
          <p>Best regards,<br>The TicketFlow Team</p>
        </div>
      </div>
    `,
    text: `${title}: ${message.replace(/<[^>]*>/g, '')}`
  })
};

// Utility functions for getting user emails
export async function getEventAttendeeEmails(eventId: string): Promise<string[]> {
  // This would typically fetch from your database
  // For now, returning empty array - implement based on your data structure
  return [];
}

export async function getAllUserEmails(): Promise<string[]> {
  // This would typically fetch all user emails from your database
  // For now, returning empty array - implement based on your data structure
  return [];
}
