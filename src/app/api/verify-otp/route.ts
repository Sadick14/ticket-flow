
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { renderTemplate } from '@/lib/email-templates';

// In a real application, this should be a secure, time-sensitive, and single-use
// value stored in your database (e.g., Firestore) or a caching layer (e.g., Redis).
// For this demo, we will use a simplified, predictable "OTP" for a given email.
const generateOTP = (email: string) => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString().substr(0, 6).padStart(6, '0');
};


export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const otp = generateOTP(email);
    
    const emailToSend = renderTemplate('emailVerification', {
        attendeeName: name || 'there',
        otpCode: otp
    });

    const success = await sendEmail({
      to: email,
      subject: emailToSend.subject,
      html: emailToSend.html,
      text: emailToSend.text,
    });

    if (success) {
      return NextResponse.json({ success: true, message: 'Verification email sent.' });
    } else {
      throw new Error('Failed to send email via provider.');
    }

  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}

// Add a new function to validate the OTP
export async function PUT(request: NextRequest) {
    try {
        const { email, otp } = await request.json();
        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        const expectedOtp = generateOTP(email);

        if (otp === expectedOtp) {
            return NextResponse.json({ success: true, message: 'Email verified successfully.' });
        } else {
            return NextResponse.json({ success: false, error: 'Invalid OTP.' }, { status: 400 });
        }

    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
    }
}
