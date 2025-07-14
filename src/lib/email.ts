import nodemailer from 'nodemailer';

// These should be stored in your .env file or environment variables
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL;

const isEmailConfigured = smtpHost && smtpPort && smtpUser && smtpPass && fromEmail;

if (!isEmailConfigured) {
  console.warn(
    'Email credentials are not fully set in environment variables. Email functionality will be disabled.'
  );
}

const transporter = isEmailConfigured ? nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
}) : null;

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export const sendEmail = async (mailOptions: MailOptions): Promise<boolean> => {
  if (!transporter) {
    console.error('Email service is not configured. Cannot send email.');
    // In a real app, you might want to throw an error, but for DX we can fail gracefully.
    // For this demo, we'll simulate a successful send in non-configured environments.
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[Email Simulation] Sent to: ${mailOptions.to}, Subject: ${mailOptions.subject}`);
        return true;
    }
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"TicketFlow" <${fromEmail}>`,
      ...mailOptions
    });
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};


// --- Email Templates ---
const emailBaseStyles = `
  font-family: Arial, sans-serif; 
  max-width: 600px; 
  margin: 0 auto; 
  padding: 20px;
  background-color: #f9fafb;
`;

const headerStyles = `
  background: linear-gradient(135deg, #1e40af, #7c3aed); 
  color: white; 
  padding: 30px; 
  border-radius: 12px; 
  text-align: center; 
  margin-bottom: 20px;
`;

const contentStyles = `
  padding: 20px; 
  background: #ffffff; 
  border-radius: 8px; 
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
`;

const footerStyles = `
  text-align: center; 
  border-top: 1px solid #e2e8f0; 
  padding-top: 20px; 
  color: #94a3b8; 
  font-size: 14px;
`;


interface TemplateResult {
    subject: string;
    html: string;
    text: string;
}

export const emailTemplates = {
  eventReminder: (eventName: string, eventDate: string, eventLocation: string): TemplateResult => ({
    subject: `📅 Reminder: ${eventName} is tomorrow!`,
    html: `
      <div style="${emailBaseStyles}">
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 28px;">Event Reminder</h1>
        </div>
        <div style="${contentStyles}">
          <h2 style="color: #1e40af; margin-top: 0;">Don't Forget!</h2>
          <p>This is a friendly reminder that <strong>${eventName}</strong> is happening tomorrow, ${eventDate}.</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
          <p>We're excited to see you there!</p>
        </div>
        <div style="${footerStyles}">
          <p>© ${new Date().getFullYear()} TicketFlow. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Don't Forget! This is a reminder for ${eventName} tomorrow, ${eventDate} at ${eventLocation}.`
  }),

  eventUpdate: (eventName: string, updateMessage: string): TemplateResult => ({
    subject: `📢 Update for ${eventName}`,
    html: `
      <div style="${emailBaseStyles}">
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 28px;">Event Update</h1>
        </div>
        <div style="${contentStyles}">
          <h2 style="color: #1e40af; margin-top: 0;">An important update regarding ${eventName}:</h2>
          <div style="white-space: pre-wrap; color: #374151;">${updateMessage}</div>
        </div>
        <div style="${footerStyles}">
          <p>© ${new Date().getFullYear()} TicketFlow. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `An important update for ${eventName}: ${updateMessage}`
  }),

  newsletter: (subject: string, content: string): TemplateResult => ({
    subject,
    html: `
      <div style="${emailBaseStyles}">
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 28px;">TicketFlow Newsletter</h1>
        </div>
        <div style="${contentStyles}">
          <h2 style="color: #1e40af; margin-top: 0;">${subject}</h2>
          <div style="white-space: pre-wrap; color: #374151;">${content}</div>
        </div>
        <div style="${footerStyles}">
          <p>You're receiving this because you're a part of the TicketFlow community.</p>
          <p>© ${new Date().getFullYear()} TicketFlow. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `${subject}\n\n${content}`
  }),

  announcement: (subject: string, content: string): TemplateResult => ({
    subject,
    html: `
      <div style="${emailBaseStyles}">
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 28px;">Platform Announcement</h1>
        </div>
        <div style="${contentStyles}">
          <h2 style="color: #1e40af; margin-top: 0;">${subject}</h2>
          <div style="white-space: pre-wrap; color: #374151;">${content}</div>
        </div>
        <div style="${footerStyles}">
          <p>© ${new Date().getFullYear()} TicketFlow. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `${subject}\n\n${content}`
  }),
};
