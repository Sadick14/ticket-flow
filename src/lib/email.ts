
import nodemailer from 'nodemailer';
import { emailTemplates, TemplateId, renderTemplate } from './email-templates';

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
  if (!transporter) {
    console.error('Email service is not configured. Cannot send email.');
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

// Re-export for server-side usage
export { emailTemplates, TemplateId, renderTemplate };
