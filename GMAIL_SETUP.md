# 📧 Gmail App Password Setup Guide

This guide will help you set up Gmail App Passwords for the TicketFlow email system.

## Step 1: Enable 2-Factor Authentication

1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the prompts to enable 2FA if not already enabled

## Step 2: Generate App Password

1. After 2FA is enabled, go back to "Security" settings
2. Under "Signing in to Google", click on "App passwords"
3. You may need to sign in again for security
4. In the "Select app" dropdown, choose "Mail"
5. In the "Select device" dropdown, choose "Other (custom name)"
6. Enter "TicketFlow" as the custom name
7. Click "Generate"
8. Copy the 16-character app password (format: xxxx xxxx xxxx xxxx)

## Step 3: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Email Service Configuration (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_email@gmail.com
SMTP_PASS=your_16_character_app_password
FROM_EMAIL=your_gmail_email@gmail.com
```

## Step 4: Railway Deployment Setup

In your Railway project dashboard, add these environment variables:

1. Go to your Railway project
2. Click on "Variables" tab
3. Add the following variables:
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: `your_gmail_email@gmail.com`
   - `SMTP_PASS`: `your_16_character_app_password`
   - `FROM_EMAIL`: `your_gmail_email@gmail.com`

## Important Notes

⚠️ **Security**: Never commit your app password to Git. Always use environment variables.

📧 **From Address**: Use the same Gmail address for both `SMTP_USER` and `FROM_EMAIL`.

🔒 **App Password**: The app password is different from your regular Gmail password. It's a 16-character code.

📊 **Rate Limits**: Gmail has sending limits:
- **Free Gmail**: 500 emails per day
- **Google Workspace**: 2,000 emails per day

## Testing the Setup

1. Deploy your changes to Railway
2. Go to the Email Management page in your dashboard
3. Send a test email to yourself
4. Check that the email is received

## Troubleshooting

### Common Issues:

1. **"Authentication failed"**: 
   - Verify 2FA is enabled
   - Double-check the app password
   - Ensure you're using the correct Gmail address

2. **"Connection refused"**:
   - Check SMTP settings (host: smtp.gmail.com, port: 587)
   - Verify environment variables are set correctly

3. **"Daily sending quota exceeded"**:
   - You've hit Gmail's daily sending limit
   - Wait 24 hours or upgrade to Google Workspace

### Support

If you encounter issues:
1. Check the Railway logs for error messages
2. Verify all environment variables are set
3. Test with a simple email first
4. Contact support if problems persist

## Alternative Email Services

If you need higher sending limits, consider these alternatives:
- **Resend**: Developer-focused email API
- **SendGrid**: High-volume email service
- **Mailgun**: Email automation platform
- **Amazon SES**: AWS email service

Each service has its own setup process and pricing structure.
