
import { NextRequest, NextResponse } from 'next/server';
import { MtnGateway } from '@/lib/gateways/mtn'; 

interface PaymentIntentRequest {
  amount: number; // in cents
  currency?: string;
  gatewayId: 'mtn-momo';
  momoNumber: string;
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
      momoNumber,
      metadata,
    }: PaymentIntentRequest = await request.json();

    if (!amount || !gatewayId || !momoNumber || !metadata?.eventId) {
      return NextResponse.json(
        { error: 'Missing required payment data' },
        { status: 400 }
      );
    }

    if (gatewayId === 'mtn-momo') {
      const paymentIntent = await MtnGateway.requestToPay(
        amount,
        currency,
        momoNumber,
        "Ticket Purchase", // Payer message
        "TicketFlow Event", // Payee note
        metadata
      );
      
      // The MTN API is asynchronous, so we return the reference ID
      // and will confirm the payment via webhook later.
      return NextResponse.json({ 
        success: true, 
        message: 'MTN MoMo payment initiated. Please approve the transaction on your phone.',
        transactionReference: paymentIntent.referenceId 
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
