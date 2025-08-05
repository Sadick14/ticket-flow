
import { NextRequest, NextResponse } from 'next/server';
import { PayoutScheduler } from '@/lib/payout-scheduler';

export async function GET(request: NextRequest) {
  // Secure this endpoint with a secret key
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await PayoutScheduler.processDuePayouts();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Cron job for payouts failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
