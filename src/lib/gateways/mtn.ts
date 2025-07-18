
import { v4 as uuidv4 } from 'uuid';
import { PAYMENT_ENV } from '../payment-env';

// This is a simplified in-memory cache for the token.
// In a production environment, you should use a more robust cache like Redis.
let tokenCache = {
  accessToken: '',
  expiresAt: 0,
};

async function getAuthToken(): Promise<string> {
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  const { baseUrl, primaryKey, userReferenceId, apiKey } = PAYMENT_ENV.mtn;

  if (!primaryKey || !userReferenceId || !apiKey) {
    throw new Error('MTN API credentials are not configured in environment variables.');
  }

  const authString = Buffer.from(`${userReferenceId}:${apiKey}`).toString('base64');
  
  const response = await fetch(`${baseUrl}/collection/token/`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': primaryKey,
      'Authorization': `Basic ${authString}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('MTN Token Error Response:', errorBody);
    throw new Error(`Failed to get MTN auth token: ${response.statusText}`);
  }

  const data = await response.json();
  const expiresIn = data.expires_in; // in seconds
  
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (expiresIn - 300) * 1000, // Refresh 5 minutes before expiry
  };

  return tokenCache.accessToken;
}

export class MtnGateway {
  static async requestToPay(
    amount: number, // amount in GHS, e.g. 50.00
    currency: string,
    momoNumber: string,
    payerMessage: string,
    payeeNote: string,
    metadata: Record<string, any>
  ): Promise<{ status: number, referenceId: string }> {
    const { baseUrl, primaryKey, callbackUrl } = PAYMENT_ENV.mtn;
    const token = await getAuthToken();
    const referenceId = uuidv4();

    const body = {
      amount: amount.toString(), // API expects amount as a string
      currency: currency,
      externalId: metadata.ticketId || uuidv4(),
      payer: {
        partyIdType: "MSISDN",
        partyId: momoNumber,
      },
      payerMessage,
      payeeNote,
    };

    const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': 'sandbox', // or 'mtnghana' for production
        'Ocp-Apim-Subscription-Key': primaryKey,
        'Content-Type': 'application/json',
        'X-Callback-Url': callbackUrl,
      },
      body: JSON.stringify(body),
    });

    // The API responds with 202 Accepted for a successful request.
    // The actual payment confirmation comes via webhook.
    if (response.status !== 202) {
      const errorBody = await response.text();
      console.error('MTN RequestToPay Error:', errorBody);
      throw new Error(`MTN payment request failed with status: ${response.statusText}`);
    }

    return { status: response.status, referenceId };
  }

  static async getTransactionStatus(referenceId: string): Promise<any> {
    const { baseUrl, primaryKey } = PAYMENT_ENV.mtn;
    const token = await getAuthToken();

    const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Ocp-Apim-Subscription-Key': primaryKey,
        'X-Target-Environment': 'sandbox',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('MTN GetTransactionStatus Error:', errorBody);
      throw new Error(`Failed to get transaction status: ${response.statusText}`);
    }

    return await response.json();
  }
}
