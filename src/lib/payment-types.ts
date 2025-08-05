
// payment-types.ts

import type { SubscriptionPlan } from './types';

// Main configuration for a payment gateway
export interface PaymentGateway {
  id: 'mtn-momo';
  name: string;
  enabled: boolean;
  processingFee: number; // Percentage fee, e.g., 1.8 for 1.8%
  currencies: string[];
}

// Stored creator payment profile
export interface CreatorPaymentProfile {
  userId: string;
  preferredGateway: 'mtn-momo';
  paymentMethod: 'momo';
  momoNumber: string;
  momoNetwork: 'MTN' | 'Vodafone' | 'AirtelTigo';
  payoutSchedule: 'daily' | 'weekly' | 'monthly';
  minimumPayoutAmount: number; // in lowest denomination (e.g., pesewas)
  isVerified: boolean;
  taxInformation?: {
    taxId: string;
    country: string;
    businessType: 'individual' | 'business';
  };
  lastPayoutDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Represents a single ticket purchase transaction
export interface Transaction {
  id: string;
  ticketId: string;
  eventId: string;
  creatorId: string;
  amount: number; // Gross amount in lowest denomination
  currency: string;
  paymentGateway: 'mtn-momo';
  gatewayTransactionId: string; // From the gateway, if applicable
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentSplit: PaymentSplit;
  payoutId: string | null; // ID of the Payout this transaction is part of
  createdAt: string;
  completedAt?: string;
  refundedAt?: string;
  metadata?: Record<string, any>;
}

// Breakdown of a single transaction
export interface PaymentSplit {
  ticketPrice: number;
  platformCommission: number; // Amount for TicketFlow
  adminCommission: number; // Your commission
  paymentProcessingFee: number; // Gateway fee
  creatorPayout: number; // Net amount for creator
  gatewayUsed: string;
}

// Represents a payout to a creator
export interface Payout {
  id: string;
  creatorId: string;
  amount: number; // Total amount paid out in lowest denomination
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: 'momo';
  transactionIds: string[]; // List of transactions included in this payout
  scheduledDate: string;
  processedDate?: string;
  failureReason?: string;
  gatewayPayoutId?: string; // ID from the payout provider
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface RefundRequest {
  id: string;
  transactionId: string;
  ticketId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied' | 'processed';
  requestedBy: string; // Can be 'attendee' or 'creator'
  processedBy?: string; // Admin ID
  requestDate: string;
  processDate?: string;
}

export interface PaymentAnalytics {
  totalRevenue: number;
  platformCommission: number;
  adminCommission: number;
  creatorPayouts: number;
  processingFees: number;
  refunds: number;
  period: { start: string; end: string };
  gatewayBreakdown: Record<string, {
    volume: number;
    transactions: number;
    fees: number;
  }>
}
