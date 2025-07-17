import { NextRequest, NextResponse } from 'next/server';
import { StripeGateway } from '@/lib/gateways/stripe';
import { PayPalGateway } from '@/lib/gateways/paypal';
// Other gateway imports can be added here

interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  gatewayId: 'stripe' | 'paypal' | 'razorpay' | 'flutterwave';
  metadata: {
    eventId: string;
    ticketId: string;
    creatorId: string;
    stripeConnectAccountId?: string; // For Stripe Connect
  };
}

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      currency = 'USD',
      gatewayId,
      metadata,
    }: PaymentIntentRequest = await request.json();

    if (!amount || !gatewayId || !metadata?.eventId) {
      return NextResponse.json(
        { error: 'Missing required payment data' },
        { status: 400 }
      );
    }

    let paymentIntent;

    switch (gatewayId) {
      case 'stripe':
        paymentIntent = await StripeGateway.createPaymentIntent(
          amount,
          currency,
          metadata
        );
        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
      
      case 'paypal':
        // The PayPal flow is different (order creation, not an intent)
        const order = await PayPalGateway.createOrder(amount, currency, metadata);
        return NextResponse.json({ orderId: order.id });
      
      // Add other gateway cases here
      
      default:
        return NextResponse.json(
          { error: 'Unsupported payment gateway' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { error: 'Failed to create payment', details: errorMessage },
      { status: 500 }
    );
  }
}
