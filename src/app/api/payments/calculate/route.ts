
import { NextRequest, NextResponse } from 'next/server';
import { PaymentCalculator, PAYMENT_GATEWAYS } from '@/lib/payment-config';
import type { SubscriptionPlan } from '@/lib/types';

interface CalculateRequest {
  amount: number; // in lowest denomination (e.g., pesewas)
  gatewayId: 'mtn-momo';
  creatorPlan: SubscriptionPlan;
}

export async function POST(request: NextRequest) {
  try {
    const { amount, gatewayId, creatorPlan }: CalculateRequest = await request.json();

    if (!amount || !gatewayId || !creatorPlan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const gateway = PAYMENT_GATEWAYS.find(g => g.id === gatewayId);
    if (!gateway) {
      return NextResponse.json({ error: 'Invalid payment gateway' }, { status: 400 });
    }

    const paymentSplit = PaymentCalculator.calculatePaymentSplit(amount, gateway, creatorPlan);

    return NextResponse.json({ success: true, ...paymentSplit });
    
  } catch (error) {
    console.error('Calculation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { error: 'Failed to calculate payment split', details: errorMessage },
      { status: 500 }
    );
  }
}
