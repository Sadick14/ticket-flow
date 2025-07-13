# 🏦 Payment Integration Guide - TicketFlow

## 🎯 Overview

This guide covers implementing the complete payment system for TicketFlow, including multiple payment gateways, commission handling, and creator payouts.

## 📦 Required Dependencies

```bash
# Install payment gateway SDKs
npm install stripe @paypal/checkout-server-sdk razorpay flutterwave-node-v3

# Firebase dependencies (if not already installed)
npm install firebase firebase-admin

# Additional utilities
npm install date-fns uuid
```

## 🔑 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...

# Database URLs (choose one)
DATABASE_URL=postgresql://...
MONGODB_URL=mongodb://...

# Email Service
SENDGRID_API_KEY=SG....
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
```

## 🏗️ Implementation Steps

### 1. Database Schema

Add these tables to your database:

```sql
-- Payment Gateways Configuration
CREATE TABLE payment_gateways (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  processing_fee DECIMAL(5,2) NOT NULL,
  fixed_fee INTEGER DEFAULT 0,
  supported_countries JSON,
  currencies JSON,
  config JSON
);

-- Creator Payment Profiles
CREATE TABLE creator_payment_profiles (
  user_id VARCHAR(100) PRIMARY KEY,
  preferred_gateway VARCHAR(50) REFERENCES payment_gateways(id),
  bank_account_details JSON,
  paypal_email VARCHAR(255),
  stripe_connect_account_id VARCHAR(100),
  tax_information JSON,
  minimum_payout_amount INTEGER DEFAULT 2000,
  payout_schedule VARCHAR(20) DEFAULT 'weekly',
  is_verified BOOLEAN DEFAULT false,
  verification_documents JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE transactions (
  id VARCHAR(100) PRIMARY KEY,
  ticket_id VARCHAR(100) NOT NULL,
  event_id VARCHAR(100) NOT NULL,
  creator_id VARCHAR(100) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_gateway VARCHAR(50) NOT NULL,
  gateway_transaction_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  payment_split JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  refunded_at TIMESTAMP,
  metadata JSON
);

-- Payouts
CREATE TABLE payouts (
  id VARCHAR(100) PRIMARY KEY,
  creator_id VARCHAR(100) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50) NOT NULL,
  transaction_ids JSON NOT NULL,
  scheduled_date DATE NOT NULL,
  processed_date DATE,
  failure_reason TEXT,
  gateway_payout_id VARCHAR(255),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refund Requests
CREATE TABLE refund_requests (
  id VARCHAR(100) PRIMARY KEY,
  transaction_id VARCHAR(100) REFERENCES transactions(id),
  ticket_id VARCHAR(100) NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  requested_by VARCHAR(100) NOT NULL,
  processed_by VARCHAR(100),
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  process_date TIMESTAMP,
  refund_method VARCHAR(50) DEFAULT 'original_payment'
);

-- Add indexes for performance
CREATE INDEX idx_transactions_creator_id ON transactions(creator_id);
CREATE INDEX idx_transactions_event_id ON transactions(event_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_payouts_creator_id ON payouts(creator_id);
CREATE INDEX idx_payouts_status ON payouts(status);
```

### 2. Environment-based Configuration

```typescript
// src/lib/payment-env.ts
export const PAYMENT_ENV = {
  stripe: {
    publicKey: process.env.STRIPE_PUBLIC_KEY!,
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID!,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    webhookId: process.env.PAYPAL_WEBHOOK_ID!,
    environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID!,
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
  },
  flutterwave: {
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY!,
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
  },
};
```

### 3. Stripe Integration

```typescript
// src/lib/gateways/stripe.ts
import Stripe from 'stripe';
import { PAYMENT_ENV } from '../payment-env';

const stripe = new Stripe(PAYMENT_ENV.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

export class StripeGateway {
  static async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>
  ) {
    return await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata,
      payment_method_types: ['card'],
      transfer_data: {
        destination: metadata.stripeConnectAccountId,
      },
    });
  }

  static async createConnectAccount(userId: string, email: string, country: string) {
    return await stripe.accounts.create({
      type: 'express',
      country,
      email,
      metadata: { userId },
    });
  }

  static async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
    return await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
  }

  static async processRefund(transactionId: string, amount?: number) {
    return await stripe.refunds.create({
      payment_intent: transactionId,
      amount,
    });
  }

  static async createPayout(accountId: string, amount: number, currency: string) {
    return await stripe.transfers.create({
      amount,
      currency,
      destination: accountId,
    });
  }
}
```

### 4. PayPal Integration

```typescript
// src/lib/gateways/paypal.ts
import paypal from '@paypal/checkout-server-sdk';
import { PAYMENT_ENV } from '../payment-env';

const environment = PAYMENT_ENV.paypal.environment === 'live' 
  ? new paypal.core.LiveEnvironment(PAYMENT_ENV.paypal.clientId, PAYMENT_ENV.paypal.clientSecret)
  : new paypal.core.SandboxEnvironment(PAYMENT_ENV.paypal.clientId, PAYMENT_ENV.paypal.clientSecret);

const client = new paypal.core.PayPalHttpClient(environment);

export class PayPalGateway {
  static async createOrder(amount: number, currency: string, metadata: any) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: (amount / 100).toFixed(2),
        },
        custom_id: metadata.ticketId,
      }],
      application_context: {
        brand_name: 'TicketFlow',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
      },
    });

    const response = await client.execute(request);
    return response.result;
  }

  static async captureOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const response = await client.execute(request);
    return response.result;
  }

  static async processRefund(captureId: string, amount?: number, currency = 'USD') {
    const request = new paypal.payments.CapturesRefundRequest(captureId);
    request.requestBody({
      amount: amount ? {
        value: (amount / 100).toFixed(2),
        currency_code: currency,
      } : undefined,
    });
    const response = await client.execute(request);
    return response.result;
  }
}
```

### 5. Automated Payout System

```typescript
// src/lib/payout-scheduler.ts
import cron from 'node-cron';
import { PaymentService } from './payment-service';

export class PayoutScheduler {
  static start() {
    // Run daily at 9 AM UTC to check for scheduled payouts
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily payout check...');
      await this.processDailyPayouts();
    });

    // Run on Mondays at 10 AM UTC for weekly payouts
    cron.schedule('0 10 * * 1', async () => {
      console.log('Running weekly payout check...');
      await this.processWeeklyPayouts();
    });

    // Run on 1st of month at 11 AM UTC for monthly payouts
    cron.schedule('0 11 1 * *', async () => {
      console.log('Running monthly payout check...');
      await this.processMonthlyPayouts();
    });
  }

  static async processDailyPayouts() {
    const payouts = await PaymentService.getPendingPayouts('daily');
    for (const payout of payouts) {
      await PaymentService.processPayout(payout.id);
    }
  }

  static async processWeeklyPayouts() {
    const payouts = await PaymentService.getPendingPayouts('weekly');
    for (const payout of payouts) {
      await PaymentService.processPayout(payout.id);
    }
  }

  static async processMonthlyPayouts() {
    const payouts = await PaymentService.getPendingPayouts('monthly');
    for (const payout of payouts) {
      await PaymentService.processPayout(payout.id);
    }
  }
}

// Start the scheduler when the application starts
PayoutScheduler.start();
```

## 🔄 Webhook Handling

### Stripe Webhooks

```typescript
// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PAYMENT_ENV } from '@/lib/payment-env';
import { PaymentService } from '@/lib/payment-service';

const stripe = new Stripe(PAYMENT_ENV.stripe.secretKey);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      PAYMENT_ENV.stripe.webhookSecret
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await PaymentService.handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await PaymentService.handlePaymentFailure(event.data.object);
        break;
      
      case 'transfer.paid':
        await PaymentService.handleTransferComplete(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
```

## 📧 Email Notifications

```typescript
// src/lib/email-service.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class EmailService {
  static async sendPaymentConfirmation(
    email: string,
    amount: number,
    eventName: string,
    transactionId: string
  ) {
    const msg = {
      to: email,
      from: 'noreply@ticketflow.com',
      subject: 'Payment Confirmation - TicketFlow',
      html: `
        <h2>Payment Confirmed!</h2>
        <p>Your payment of $${(amount / 100).toFixed(2)} for <strong>${eventName}</strong> has been processed successfully.</p>
        <p>Transaction ID: ${transactionId}</p>
        <p>You will receive your tickets via email shortly.</p>
      `,
    };

    await sgMail.send(msg);
  }

  static async sendPayoutNotification(
    email: string,
    amount: number,
    payoutDate: string,
    payoutId: string
  ) {
    const msg = {
      to: email,
      from: 'payouts@ticketflow.com',
      subject: 'Payout Processed - TicketFlow',
      html: `
        <h2>Payout Processed!</h2>
        <p>Your payout of $${(amount / 100).toFixed(2)} has been processed and is on its way to your account.</p>
        <p>Payout ID: ${payoutId}</p>
        <p>Processing Date: ${payoutDate}</p>
        <p>You should see the funds in your account within 1-3 business days.</p>
      `,
    };

    await sgMail.send(msg);
  }
}
```

## 🧪 Testing

### Test Cards for Stripe
```typescript
const TEST_CARDS = {
  visa: '4242424242424242',
  visaDebit: '4000056655665556',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  declined: '4000000000000002',
  insufficient: '4000000000009995',
};
```

### Test Environment Setup
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Test specific payment flows
npm run test:payments
```

## 🚀 Deployment Checklist

### Production Setup
- [ ] Switch all payment gateways to production mode
- [ ] Update webhook URLs to production endpoints
- [ ] Set up SSL certificates for webhook endpoints
- [ ] Configure production database
- [ ] Set up monitoring and alerting
- [ ] Test all payment flows in staging
- [ ] Set up automated backups
- [ ] Configure error logging and monitoring

### Security Checklist
- [ ] All API keys are in environment variables
- [ ] Webhook signatures are verified
- [ ] Payment data is encrypted at rest
- [ ] PCI compliance requirements met
- [ ] Rate limiting enabled on payment endpoints
- [ ] Input validation on all payment forms
- [ ] Audit logs for all payment operations

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer Docs](https://developer.paypal.com)
- [Razorpay API Reference](https://razorpay.com/docs/api)
- [Flutterwave Documentation](https://developer.flutterwave.com)
- [PCI Compliance Guide](https://www.pcisecuritystandards.org)

---

*This integration guide provides a complete foundation for implementing the TicketFlow payment system. Customize based on your specific requirements and compliance needs.*
