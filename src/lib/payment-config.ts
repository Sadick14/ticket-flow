
// payment-config.ts
import type { PaymentGateway, PaymentSplit } from './payment-types';
import type { SubscriptionPlan } from './types';

export const PAYMENT_CONFIG = {
  platformFee: 0.01, // 1%
  commissionRates: {
    Free: 0.05,      // 5%
    Essential: 0.03, // 3%
    Pro: 0.01,       // 1%
    Custom: 0.01,    // Default custom to 1%, can be overridden
  } as Record<SubscriptionPlan, number>,
};

export const PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    id: 'mtn-momo',
    name: 'MTN Mobile Money',
    enabled: true,
    processingFee: 1.8, // 1.8%
    currencies: ['GHS'],
  }
];

export class PaymentCalculator {
  static getCommissionRate(plan: SubscriptionPlan): number {
    return PAYMENT_CONFIG.commissionRates[plan] || PAYMENT_CONFIG.commissionRates.Free;
  }

  static calculatePaymentSplit(
    ticketPrice: number, // in lowest denomination, e.g., pesewas
    gateway: PaymentGateway,
    creatorPlan: SubscriptionPlan
  ): PaymentSplit {
    const adminCommissionRate = this.getCommissionRate(creatorPlan);
    const platformFeeRate = PAYMENT_CONFIG.platformFee;
    const gatewayFeeRate = gateway.processingFee / 100;

    const adminCommission = Math.round(ticketPrice * adminCommissionRate);
    const platformCommission = Math.round(ticketPrice * platformFeeRate);
    const paymentProcessingFee = Math.round(ticketPrice * gatewayFeeRate);

    const totalDeductions = adminCommission + platformCommission + paymentProcessingFee;
    const creatorPayout = ticketPrice - totalDeductions;

    return {
      ticketPrice,
      platformCommission,
      adminCommission,
      paymentProcessingFee,
      creatorPayout,
      gatewayUsed: gateway.id,
    };
  }

  static formatCurrency(amount: number, currency = 'GHS'): string {
    const majorUnitAmount = amount / 100;
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
    }).format(majorUnitAmount);
  }
}
