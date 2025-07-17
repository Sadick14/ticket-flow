
export const PAYMENT_ENV = {
  mtn: {
    baseUrl: process.env.MTN_BASE_URL || 'https://sandbox.momodeveloper.mtn.com',
    primaryKey: process.env.MTN_PRIMARY_KEY!, // This is the Ocp-Apim-Subscription-Key
    userReferenceId: process.env.MTN_USER_REFERENCE_ID!,
    apiKey: process.env.MTN_API_KEY!,
    callbackUrl: process.env.MTN_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mtn`,
  },
  // --- Commented out other gateways ---
  /*
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
  */
};
