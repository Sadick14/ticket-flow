
import { NextRequest, NextResponse } from 'next/server';
// Import gateway logic as needed
// import { MtnGateway } from '@/lib/gateways/mtn'; 

interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  gatewayId: 'mtn-momo';
  metadata: {
    eventId: string;
    ticketId: string;
    creatorId: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      currency = 'GHS',
      gatewayId,
      metadata,
    }: PaymentIntentRequest = await request.json();

    if (!amount || !gatewayId || !metadata?.eventId) {
      return NextResponse.json(
        { error: 'Missing required payment data' },
        { status: 400 }
      );
    }

    if (gatewayId === 'mtn-momo') {
      // Placeholder for direct MTN MoMo API integration
      // const paymentIntent = await MtnGateway.createPaymentRequest(amount, currency, metadata);
      // return NextResponse.json({ clientSecret: paymentIntent.transactionId, ... });
      
      // For now, return a success placeholder as the API is not yet provided
      return NextResponse.json({ 
        success: true, 
        message: 'MTN MoMo payment initiated (placeholder).',
        transactionId: `test_momo_${Date.now()}` 
      });
    }
    
    return NextResponse.json(
      { error: 'Unsupported payment gateway' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Payment creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { error: 'Failed to create payment', details: errorMessage },
      { status: 500 }
    );
  }
}
