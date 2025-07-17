import { NextRequest, NextResponse } from 'next/server';
import { PaymentCalculator, PAYMENT_GATEWAYS } from '@/lib/payment-config';
import type { PaymentSplit, TicketPaymentInfo } from '@/lib/payment-types';

export async function POST(request: NextRequest) {
  try {
    const { 
      ticketPrice, // in cents
      gatewayId, 
      passFeeToCustomer = true,
      currency = 'USD'
    } = await request.json();

    if (!ticketPrice || ticketPrice < 100) { // Minimum $1.00
      return NextResponse.json(
        { error: 'Ticket price must be at least $1.00' },
        { status: 400 }
      );
    }

    const gateway = PAYMENT_GATEWAYS.find(g => g.id === gatewayId);
    if (!gateway) {
      return NextResponse.json(
        { error: 'Invalid payment gateway' },
        { status: 400 }
      );
    }

    const paymentSplit = PaymentCalculator.calculatePaymentSplit(
      ticketPrice,
      gateway,
      passFeeToCustomer
    );

    const customerTotal = PaymentCalculator.calculateTicketTotal(
      ticketPrice,
      gateway,
      passFeeToCustomer
    );

    return NextResponse.json({
      paymentSplit,
      customerTotal,
      gateway: {
        id: gateway.id,
        name: gateway.name,
        processingFee: gateway.processingFee,
        fixedFee: gateway.fixedFee
      }
    });

  } catch (error) {
    console.error('Payment calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'US';
    const currency = searchParams.get('currency') || 'USD';

    const availableGateways = PaymentCalculator.getAvailableGateways(country, currency);
    
    const bestGateway = PaymentCalculator.getBestGateway(country, currency, 5000); // $50 average

    return NextResponse.json({
      availableGateways: availableGateways.map(gateway => ({
        id: gateway.id,
        name: gateway.name,
        processingFee: gateway.processingFee,
        fixedFee: gateway.fixedFee,
        currencies: gateway.currencies
      })),
      recommendedGateway: bestGateway ? {
        id: bestGateway.id,
        name: bestGateway.name,
        reason: 'Lowest fees for your region'
      } : null,
      country,
      currency
    });

  } catch (error) {
    console.error('Gateway lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment gateways' },
      { status: 500 }
    );
  }
}
