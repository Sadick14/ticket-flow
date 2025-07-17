import Stripe from 'stripe';
import { PAYMENT_ENV } from '../payment-env';

const stripe = new Stripe(PAYMENT_ENV.stripe.secretKey, {
  apiVersion: '2024-06-20',
});

export class StripeGateway {
  static async createPaymentIntent(
    amount: number, // amount in cents
    currency: string,
    metadata: Record<string, any>
  ) {
    const params: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // If using Stripe Connect for direct charges
    if (metadata.stripeConnectAccountId) {
      params.transfer_data = {
        destination: metadata.stripeConnectAccountId,
        // The amount that will be transferred to the destination account.
        // By default, the entire amount is transferred to the destination.
        // You can also specify an application_fee_amount to take a cut.
        // amount: metadata.creatorPayoutAmount, // Example if you calculate payout beforehand
      };
    }
    
    return await stripe.paymentIntents.create(params);
  }

  static async createConnectAccount(email: string, country: string) {
    return await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
  }

  static async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
    return await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
      collect: 'eventually_due',
    });
  }

  static async processRefund(paymentIntentId: string, amount?: number) {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount, // amount in cents
    });
  }

  static async createPayout(accountId: string, amount: number, currency: string) {
    return await stripe.transfers.create({
      amount, // amount in cents
      currency,
      destination: accountId,
    });
  }
}
