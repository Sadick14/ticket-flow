
export const PAYMENT_ENV = {
  stripe: {
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!,
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
