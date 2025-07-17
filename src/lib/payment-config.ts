
import type { 
  PaymentConfiguration, 
  PaymentGateway, 
  PaymentSplit,
  TicketPaymentInfo 
} from './payment-types';

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
  /*
  {
    id: 'stripe',
    name: 'Stripe',
    enabled: true,
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'EU', 'NG', 'GH', 'KE', 'ZA'],
    processingFee: 2.9, // 2.9%
    fixedFee: 30, // $0.30
    currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'GHS', 'KES', 'ZAR']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    enabled: true,
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'EU', 'NG', 'GH', 'KE', 'ZA'],
    processingFee: 3.49, // 3.49%
    fixedFee: 49, // $0.49
    currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    enabled: true,
    supportedCountries: ['IN', 'MY', 'SG'],
    processingFee: 2.0, // 2.0%
    fixedFee: 0,
    currencies: ['INR', 'MYR', 'SGD']
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    enabled: true,
    supportedCountries: ['NG', 'GH', 'KE', 'UG', 'TZ', 'RW', 'ZM', 'ZA'],
    processingFee: 1.4, // 1.4%
    fixedFee: 0,
    currencies: ['NGN', 'GHS', 'KES', 'UGX', 'TZS', 'RWF', 'ZMW', 'ZAR', 'USD']
  }
  */
];

// Platform configuration
export const PAYMENT_CONFIG: PaymentConfiguration = {
  adminCommissionRate: 0.05, // 5%
  platformFee: 0.01, // 1% additional platform fee
  minimumPayout: 1000, // $10.00 minimum payout
  payoutSchedule: 'weekly',
  supportedGateways: PAYMENT_GATEWAYS,
  defaultGateway: 'mtn-momo'
};

// Utility functions for payment calculations
export class PaymentCalculator {
  static calculatePaymentSplit(
    ticketPrice: number,
    gateway: PaymentGateway,
    passFeeToCustomer: boolean = false
  ): PaymentSplit {
    const baseAmount = ticketPrice;
    
    // Calculate payment processing fee
    const processingFeePercent = gateway.processingFee / 100;
    const processingFee = Math.round(
      (baseAmount * processingFeePercent) + gateway.fixedFee
    );
    
    // Calculate platform commission (admin gets 5%)
    const adminCommission = Math.round(baseAmount * PAYMENT_CONFIG.adminCommissionRate);
    
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
      currency: 'USD', // Default, should be dynamic based on location
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
    
    // Find gateway with lowest total fee for this transaction
    const gatewayWithFees = availableGateways.map(gateway => {
      const fee = (amount * gateway.processingFee / 100) + gateway.fixedFee;
      return { gateway, totalFee: fee };
    });
    
    gatewayWithFees.sort((a, b) => a.totalFee - b.totalFee);
    return gatewayWithFees[0].gateway;
  }
  
  static formatCurrency(amount: number, currency: string = 'GHS'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100); // assuming amount is in cents
  }
  
  static validateMinimumPayout(amount: number): boolean {
    return amount >= PAYMENT_CONFIG.minimumPayout;
  }
}
