
import 'dotenv/config';
import nodemailer from 'nodemailer';
import { emailTemplates, renderTemplate } from './email-templates';
import type { TemplateId } from './email-templates';

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;
const fromEmail = process.env.FROM_EMAIL || process.env.GMAIL_USER;

const isEmailConfigured = !!(smtpHost && smtpPort && smtpUser && smtpPass && fromEmail);

console.log('Email Configuration Status:', {
  smtpHost: !!smtpHost,
  smtpPort: !!smtpPort,
  smtpUser: !!smtpUser,
  smtpPass: !!smtpPass,
  fromEmail: !!fromEmail,
  isConfigured: isEmailConfigured
});

if (!isEmailConfigured) {
  console.warn(
    'Email credentials are not fully set in environment variables. Email functionality will be disabled.',
    {
      missing: {
        smtpHost: !smtpHost,
        smtpPort: !smtpPort,
        smtpUser: !smtpUser,
        smtpPass: !smtpPass,
        fromEmail: !fromEmail
      }
    }
  );
}

const transporter = isEmailConfigured ? nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
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
  console.log('sendEmail called with:', { to: mailOptions.to, subject: mailOptions.subject });
  
  if (!transporter) {
    console.error('Email service is not configured. Cannot send email.');
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[Email Simulation] Sent to: ${mailOptions.to}, Subject: ${mailOptions.subject}`);
        return true;
    }
    return false;
  }

  try {
    console.log('Attempting to send email via SMTP...');
    const info = await transporter.sendMail({
      from: `"TicketFlow" <${fromEmail}>`,
      ...mailOptions
    });
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Email details:', { to: mailOptions.to, subject: mailOptions.subject });
    return false;
  }
};

// Re-export for server-side usage
export { emailTemplates, renderTemplate };
export type { TemplateId };
