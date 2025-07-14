
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { renderTemplate } from '@/lib/email-templates';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// In a real application, this should be a secure, time-sensitive, and single-use
// value stored in your database (e.g., Firestore) or a caching layer (e.g., Redis).
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const storeOtp = async (email: string, otp: string) => {
  const otpRef = doc(db, 'otps', email);
  // Store OTP with a timestamp (expires in 10 minutes)
  await setDoc(otpRef, { 
    code: otp, 
    createdAt: serverTimestamp(),
  });
};

const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    const otpRef = doc(db, 'otps', email);
    const docSnap = await getDoc(otpRef);

    if (!docSnap.exists()) {
        return false;
    }
    const data = docSnap.data();
    const isExpired = (new Date().getTime() - data.createdAt.toDate().getTime()) > 10 * 60 * 1000; // 10 minutes
    
    if(isExpired) {
        return false;
    }

    return data.code === otp;
};


export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const otp = generateOTP();
    await storeOtp(email, otp);
    
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

        const isValid = await verifyOtp(email, otp);

        if (isValid) {
            return NextResponse.json({ success: true, message: 'Email verified successfully.' });
        } else {
            return NextResponse.json({ success: false, error: 'Invalid or expired OTP.' }, { status: 400 });
        }

    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
    }
}
