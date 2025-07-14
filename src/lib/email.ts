import nodemailer from 'nodemailer';

// These should be stored in your .env file
const fromEmail = process.env.GMAIL_USER;
const appPassword = process.env.GMAIL_APP_PASS;

if (!fromEmail || !appPassword) {
  console.warn(
    'Email credentials (GMAIL_USER, GMAIL_APP_PASS) are not set in .env file. Email functionality will be disabled.'
  );
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: fromEmail,
    pass: appPassword,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ to, subject, html }: MailOptions) => {
  if (!fromEmail || !appPassword) {
    throw new Error('Email service is not configured.');
  }

  const mailOptions = {
    from: `"TicketFlow" <${fromEmail}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
};
