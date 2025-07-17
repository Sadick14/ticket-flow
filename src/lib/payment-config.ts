
import type { 
  PaymentConfiguration, 
  PaymentGateway, 
  PaymentSplit,
  TicketPaymentInfo,
  SubscriptionPlan
} from './payment-types';
import type { UserProfile } from './types';

// Payment gateway configurations
export const PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    id: 'mtn-momo',
    name: 'MTN Mobile Money',
    enabled: true,
    supportedCountries: ['GH', 'NG', 'KE', 'ZA', 'UG', 'RW', 'ZM'],
    processingFee: 1.5, // Example fee, adjust as needed
    fixedFee: 0, 
    currencies: ['GHS', 'NGN', 'KES', 'ZAR', 'UGX', 'RWF', 'ZMW']
  },
];

// Platform configuration
export const PAYMENT_CONFIG: PaymentConfiguration = {
  commissionRates: {
    Free: 0.05, // 5%
    Essential: 0.03, // 3%
    Pro: 0.01, // 1%
  },
  platformFee: 0.01, // 1% additional platform fee
  minimumPayout: 1000, // 10 GHS in lowest denomination
  payoutSchedule: 'weekly',
  supportedGateways: PAYMENT_GATEWAYS,
  defaultGateway: 'mtn-momo'
};

// Utility functions for payment calculations
export class PaymentCalculator {
  static getCommissionRate(plan: SubscriptionPlan): number {
    return PAYMENT_CONFIG.commissionRates[plan] || PAYMENT_CONFIG.commissionRates['Free'];
  }

  static calculatePaymentSplit(
    ticketPrice: number,
    gateway: PaymentGateway,
    creatorPlan: SubscriptionPlan
  ): PaymentSplit {
    const baseAmount = ticketPrice;
    
    // Calculate payment processing fee
    const processingFeePercent = gateway.processingFee / 100;
    const processingFee = Math.round(
      (baseAmount * processingFeePercent) + gateway.fixedFee
    );
    
    const commissionRate = this.getCommissionRate(creatorPlan);
    const adminCommission = Math.round(baseAmount * commissionRate);
    
    // Calculate additional platform fee
    const platformCommission = Math.round(baseAmount * PAYMENT_CONFIG.platformFee);
    
    // Calculate creator payout
    const totalDeductions = processingFee + adminCommission + platformCommission;
    const creatorPayout = baseAmount - totalDeductions;
    
    return {
      ticketPrice: baseAmount,
      platformCommission,
      adminCommission,
      paymentProcessingFee: processingFee,
      creatorPayout: Math.max(0, creatorPayout),
      gatewayUsed: gateway.id
    };
  }
  
  static calculateTicketTotal(
    basePrice: number,
    gateway: PaymentGateway,
    passFeeToCustomer: boolean = true
  ): TicketPaymentInfo {
    const processingFeePercent = gateway.processingFee / 100;
    const processingFee = Math.round(
      (basePrice * processingFeePercent) + gateway.fixedFee
    );
    
    const platformFee = Math.round(basePrice * PAYMENT_CONFIG.platformFee);
    
    const totalAmount = passFeeToCustomer 
      ? basePrice + processingFee + platformFee
      : basePrice;
    
    return {
      basePrice,
      processingFee: passFeeToCustomer ? processingFee : 0,
      platformFee: passFeeToCustomer ? platformFee : 0,
      totalAmount,
      currency: 'GHS', // Default to GHS
      paymentGateway: gateway.id,
      transactionId: '' // Will be filled after payment
    };
  }
  
  static getAvailableGateways(country: string, currency: string): PaymentGateway[] {
    return PAYMENT_GATEWAYS.filter(gateway => 
      gateway.enabled &&
      gateway.supportedCountries.includes(country) &&
      gateway.currencies.includes(currency)
    );
  }
  
  static getBestGateway(country: string, currency: string, amount: number): PaymentGateway | null {
    const availableGateways = this.getAvailableGateways(country, currency);
    
    if (availableGateways.length === 0) {
      return null;
    }
    
    const gatewayWithFees = availableGateways.map(gateway => {
      const fee = (amount * gateway.processingFee / 100) + gateway.fixedFee;
      return { gateway, totalFee: fee };
    });
    
    gatewayWithFees.sort((a, b) => a.totalFee - b.totalFee);
    return gatewayWithFees[0].gateway;
  }
  
  static formatCurrency(amount: number, currency: string = 'GHS'): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100); // assuming amount is in lowest denomination (e.g. pesewas)
  }
  
  static validateMinimumPayout(amount: number): boolean {
    return amount >= PAYMENT_CONFIG.minimumPayout;
  }
}
