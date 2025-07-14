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

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com

# Email Service
SENDGRID_API_KEY=SG....
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
```

## 🏗️ Implementation Steps

### 1. Firebase Firestore Collections

Set up these collections in your Firebase Firestore:

```typescript
// Firestore Collection Structure

// /paymentGateways/{gatewayId}
interface PaymentGatewayDoc {
  id: string;
  name: string;
  enabled: boolean;
  processingFee: number;
  fixedFee: number;
  supportedCountries: string[];
  currencies: string[];
  config: Record<string, any>;
}

// /users/{userId}/paymentProfile
interface CreatorPaymentProfileDoc {
  userId: string;
  preferredGateway: string;
  bankAccountDetails?: {
    accountNumber: string;
    routingNumber: string;
    accountHolderName: string;
    bankName: string;
    country: string;
  };
  paypalEmail?: string;
  stripeConnectAccountId?: string;
  taxInformation?: {
    taxId: string;
    country: string;
    businessType: 'individual' | 'business';
  };
  minimumPayoutAmount: number;
  payoutSchedule: 'daily' | 'weekly' | 'monthly';
  isVerified: boolean;
  verificationDocuments?: string[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// /transactions/{transactionId}
interface TransactionDoc {
  id: string;
  ticketId: string;
  eventId: string;
  creatorId: string;
  amount: number;
  currency: string;
  paymentGateway: string;
  gatewayTransactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  paymentSplit: {
    ticketPrice: number;
    platformCommission: number;
    adminCommission: number;
    paymentProcessingFee: number;
    creatorPayout: number;
    gatewayUsed: string;
  };
  createdAt: FirebaseFirestore.Timestamp;
  completedAt?: FirebaseFirestore.Timestamp;
  refundedAt?: FirebaseFirestore.Timestamp;
  metadata?: Record<string, any>;
}

// /payouts/{payoutId}
interface PayoutDoc {
  id: string;
  creatorId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: 'bank_transfer' | 'paypal' | 'stripe_express';
  transactionIds: string[];
  scheduledDate: FirebaseFirestore.Timestamp;
  processedDate?: FirebaseFirestore.Timestamp;
  failureReason?: string;
  gatewayPayoutId?: string;
  metadata?: Record<string, any>;
  createdAt: FirebaseFirestore.Timestamp;
}

// /refundRequests/{refundId}
interface RefundRequestDoc {
  id: string;
  transactionId: string;
  ticketId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied' | 'processed';
  requestedBy: string;
  processedBy?: string;
  requestDate: FirebaseFirestore.Timestamp;
  processDate?: FirebaseFirestore.Timestamp;
  refundMethod: 'original_payment' | 'store_credit';
}
```

### Initialize Firebase Collections with Default Data

```typescript
// src/lib/firebase-setup.ts
import { db } from './firebase';
import { PAYMENT_GATEWAYS } from './payment-config';
import { doc, setDoc, collection } from 'firebase/firestore';

export async function initializePaymentGateways() {
  const batch = db.batch();
  
  for (const gateway of PAYMENT_GATEWAYS) {
    const gatewayRef = doc(db, 'paymentGateways', gateway.id);
    batch.set(gatewayRef, {
      ...gateway,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  await batch.commit();
  console.log('Payment gateways initialized in Firestore');
}

// Run this once to initialize your payment gateways
// initializePaymentGateways();
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
