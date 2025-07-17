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
          value: (amount / 100).toFixed(2), // Assume amount is in cents
        },
        custom_id: metadata.ticketId,
        description: `Ticket for ${metadata.eventName}`
      }],
      application_context: {
        brand_name: 'TicketFlow',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${metadata.eventId}?paypal_success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${metadata.eventId}?paypal_cancel=true`,
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
