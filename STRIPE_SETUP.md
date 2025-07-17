# 🚀 Stripe Live Payment Setup Guide - Go Live in 5 Minutes!

Your TicketFlow application is already built to handle real payments. The final step is to activate your Stripe account and add your **LIVE** API keys.

Follow these steps to start accepting real credit card payments.

## Step 1: Activate Your Stripe Account

1.  **Go to your Stripe Dashboard:** [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
2.  **Click "Activate your account"**: You'll see a checklist of business information Stripe needs to verify your identity and business. This is required by financial regulations.
3.  **Complete the form**: You will need to provide:
    *   Your business type (Individual, Sole Proprietor, LLC, etc.)
    *   Business address and phone number
    *   Your bank account details for payouts (where Stripe will send your money)
    *   Personal identification details (for the business owner/representative)

The activation process is usually very fast, often instant.

## Step 2: Get Your LIVE API Keys

1.  Once your account is activated, make sure you are in **Live mode**. Look for the toggle in the top-right or top-left of your Stripe Dashboard.
2.  Go to the **Developers** section in the dashboard.
3.  Click on the **API Keys** tab.
4.  You will see your **Publishable key** and **Secret key**.
    *   The Publishable key starts with `pk_live_...`
    *   The Secret key starts with `sk_live_...` (You may need to click "Reveal live key" to see it).

## Step 3: Add Live Keys to Your Environment

Update your `.env` file (or your hosting provider's environment variables, like Railway) with the **LIVE** keys you just copied.

```bash
# .env file

# --- STRIPE LIVE KEYS ---
# Replace the test keys with your new live keys
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# You'll also need to create a new webhook for live events
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Important:** You must also create a new **webhook endpoint** in live mode in your Stripe Dashboard. The test mode webhook will not work for live transactions.
- Go to Developers > Webhooks.
- Click "Add endpoint".
- The URL will be `https://<your-production-url>/api/webhooks/stripe`.
- Select the `payment_intent.succeeded` and `payment_intent.payment_failed` events.
- Copy the new webhook signing secret (`whsec_...`) and add it to your environment variables.

## Step 4: Deploy & Test

Once you've updated your environment variables with the live keys, re-deploy your application.

Your payment forms will now be processing **real credit card payments**. It's a good idea to make a small, real transaction (e.g., a $1.00 ticket) to confirm everything is working correctly.

**Congratulations! Your TicketFlow platform is now fully operational and ready to accept live payments.**