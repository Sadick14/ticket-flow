
export const PAYMENT_ENV = {
  mtn: {
    baseUrl: process.env.MTN_BASE_URL || 'https://sandbox.momodeveloper.mtn.com',
    primaryKey: process.env.MTN_PRIMARY_KEY!, // This is the Ocp-Apim-Subscription-Key
    userReferenceId: process.env.MTN_USER_REFERENCE_ID!,
    apiKey: process.env.MTN_API_KEY!,
    callbackUrl: process.env.MTN_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mtn`,
  },
  // --- Other gateways are commented out as requested ---
  /*
  stripe: { ... },
  paypal: { ... },
  */
};
