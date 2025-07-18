
import { NextRequest, NextResponse } from 'next/server';
import { MtnGateway } from '@/lib/gateways/mtn'; 
import { FirebasePaymentService } from '@/lib/firebase-payment-service';
import { PAYMENT_GATEWAYS, PaymentCalculator } from '@/lib/payment-config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';


interface PaymentIntentRequest {
  amount: number; // in cents/pesewas
  currency?: string;
  gatewayId: 'mtn-momo';
  momoNumber: string;
  metadata: {
    eventId?: string;
    ticketId?: string;
    creatorId?: string;
    userId?: string;
    plan?: string;
    type: 'ticket' | 'subscription';
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

    if (!amount || !gatewayId || !momoNumber || !metadata?.type) {
      return NextResponse.json(
        { error: 'Missing required payment data' },
        { status: 400 }
      );
    }
    
    let transactionId: string | null = null;
    let paymentNote = 'TicketFlow Purchase';
    let payerMessage = 'Payment for service';

    // If it's a ticket purchase, create a transaction record first
    if (metadata.type === 'ticket' && metadata.eventId && metadata.creatorId && metadata.ticketId) {
        const creatorDoc = await getDoc(doc(db, 'users', metadata.creatorId));
        const creatorPlan = creatorDoc.exists() ? (creatorDoc.data() as UserProfile).subscriptionPlan : 'Free';

        const gateway = PAYMENT_GATEWAYS.find(g => g.id === gatewayId);
        if (!gateway) {
            return NextResponse.json({ error: 'Invalid payment gateway' }, { status: 400 });
        }
        
        const paymentSplit = PaymentCalculator.calculatePaymentSplit(amount, gateway, creatorPlan);

        transactionId = await FirebasePaymentService.createTransaction(
            metadata.ticketId,
            metadata.eventId,
            metadata.creatorId,
            amount,
            gatewayId,
            paymentSplit,
            { buyerId: metadata.userId }
        );
        paymentNote = `Ticket for event ${metadata.eventId}`;
        payerMessage = `Ticket Purchase`;
    } else if (metadata.type === 'subscription' && metadata.userId && metadata.plan) {
      // For subscriptions, we don't create a transaction record in the same way,
      // but we could log it elsewhere if needed.
      paymentNote = `Subscription for ${metadata.plan} plan`;
      payerMessage = 'Subscription Payment';
    }


    if (gatewayId === 'mtn-momo') {
      const paymentIntent = await MtnGateway.requestToPay(
        amount / 100, // MTN API expects amount in major unit (e.g., GHS, not pesewas)
        currency,
        momoNumber,
        payerMessage,
        paymentNote,
        { ...metadata, transactionId } // Pass internal transactionId to webhook if available
      );
      
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
