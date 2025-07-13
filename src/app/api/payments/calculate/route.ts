import { NextRequest, NextResponse } from 'next/server';
import { PaymentCalculator, PAYMENT_GATEWAYS } from '@/lib/payment-config';
import type { PaymentSplit, Transaction } from '@/lib/payment-types';

export async function POST(request: NextRequest) {
  try {
    const { 
      ticketPrice, 
      gatewayId, 
      passFeeToCustomer = true,
      currency = 'USD'
    } = await request.json();

    // Validate input
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

    // Calculate payment split
    const paymentSplit = PaymentCalculator.calculatePaymentSplit(
      ticketPrice,
      gateway,
      passFeeToCustomer
    );

    // Calculate customer-facing total
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

    // Get available payment gateways for the country/currency
    const availableGateways = PaymentCalculator.getAvailableGateways(country, currency);
    
    // Get best gateway recommendation
    const bestGateway = PaymentCalculator.getBestGateway(country, currency, 5000); // $50 average

    return NextResponse.json({
      availableGateways: availableGateways.map(gateway => ({
        id: gateway.id,
        name: gateway.name,
        processingFee: gateway.processingFee,
        fixedFee: gateway.fixedFee,
        currencies: gateway.currencies
      })),
      recommendedGateway: {
        id: bestGateway.id,
        name: bestGateway.name,
        reason: 'Lowest fees for your region'
      },
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
