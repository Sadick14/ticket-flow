import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { FirebasePaymentService } from '@/lib/firebase-payment-service';
import { PAYMENT_ENV } from '@/lib/payment-env';

const stripe = new Stripe(PAYMENT_ENV.stripe.secretKey);

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const transactionId = paymentIntent.metadata.transactionId;
    if (!transactionId) {
        console.error("No transactionId in paymentIntent metadata");
        return;
    }

    await FirebasePaymentService.updateTransaction(transactionId, {
        status: 'completed',
        gatewayTransactionId: paymentIntent.id
    });
    
    // Additional logic like sending confirmation email, updating ticket status, etc.
    // can be triggered from here.
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const transactionId = paymentIntent.metadata.transactionId;
    if (!transactionId) {
        console.error("No transactionId in paymentIntent metadata");
        return;
    }

    await FirebasePaymentService.updateTransaction(transactionId, {
        status: 'failed',
        gatewayTransactionId: paymentIntent.id,
        metadata: {
            ...paymentIntent.metadata,
            failureReason: paymentIntent.last_payment_error?.message || 'Unknown error'
        }
    });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      PAYMENT_ENV.stripe.webhookSecret
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    
    // ... handle other event types
    
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
