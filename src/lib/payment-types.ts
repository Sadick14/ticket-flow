
// Payment system types and interfaces
import { SubscriptionPlan } from './types';

export interface PaymentGateway {
  id: 'mtn-momo';
  name: string;
  enabled: boolean;
  supportedCountries: string[];
  processingFee: number; // percentage
  fixedFee: number; // fixed amount in lowest denomination (e.g., pesewas)
  currencies: string[];
}

export interface PaymentConfiguration {
  commissionRates: Record<SubscriptionPlan, number>;
  platformFee: number; // additional platform fee percentage
  minimumPayout: number; // minimum amount for creator payout
  payoutSchedule: 'daily' | 'weekly' | 'monthly';
  supportedGateways: PaymentGateway[];
  defaultGateway: PaymentGateway['id'];
}

export interface PaymentSplit {
  ticketPrice: number;
  platformCommission: number;
  adminCommission: number;
  paymentProcessingFee: number;
  creatorPayout: number;
  gatewayUsed: PaymentGateway['id'];
}

export interface Transaction {
  id: string;
  ticketId: string;
  eventId: string;
  creatorId: string;
  amount: number;
  currency: string;
  paymentGateway: PaymentGateway['id'];
  gatewayTransactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  paymentSplit: PaymentSplit;
  createdAt: string;
  completedAt?: string;
  refundedAt?: string;
  metadata?: Record<string, any>;
}

export interface Payout {
  id: string;
  creatorId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: 'momo';
  transactionIds: string[]; // transactions included in this payout
  scheduledDate: string;
  processedDate?: string;
  failureReason?: string;
  gatewayPayoutId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CreatorPaymentProfile {
  userId: string;
  preferredGateway: PaymentGateway['id'];
  paymentMethod: 'momo';
  momoNumber: string;
  momoNetwork: string;
  taxInformation?: {
    taxId: string;
    country: string;
    businessType: 'individual' | 'business';
  };
  minimumPayoutAmount: number;
  payoutSchedule: 'daily' | 'weekly' | 'monthly';
  isVerified: boolean;
  verificationDocuments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RefundRequest {
  id: string;
  transactionId: string;
  ticketId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied' | 'processed';
  requestedBy: string; // userId who requested
  processedBy?: string; // admin who processed
  requestDate: string;
  processDate?: string;
  refundMethod: 'original_payment' | 'store_credit';
}

export interface PaymentAnalytics {
  totalRevenue: number;
  platformCommission: number;
  adminCommission: number;
  creatorPayouts: number;
  processingFees: number;
  refunds: number;
  period: {
    start: string;
    end: string;
  };
  gatewayBreakdown: Record<PaymentGateway['id'], {
    volume: number;
    transactions: number;
    fees: number;
  }>;
}

// Add to existing Ticket interface
export interface TicketPaymentInfo {
  basePrice: number;
  processingFee: number;
  platformFee: number;
  totalAmount: number;
  currency: string;
  paymentGateway: PaymentGateway['id'];
  transactionId: string;
}
