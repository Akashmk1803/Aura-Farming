import { stripe } from '@/lib/stripe';

const MOCK_MODE = process.env.MOCK_PAYMENTS === 'true';

export interface PaymentIntentResult {
  id: string;
  client_secret: string;
  status: string;
  mock: boolean;
}

export async function createPaymentIntent(
  amount: number,
  metadata: Record<string, string>,
  description: string
): Promise<PaymentIntentResult> {
  if (MOCK_MODE) {
    // Simulated payment intent — no network call, always "succeeds"
    const fakeId = 'pi_mock_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
    return {
      id: fakeId,
      client_secret: fakeId + '_secret_mock',
      status: 'succeeded',
      mock: true,
    };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'inr',
    metadata,
    description,
  });

  return {
    id: paymentIntent.id,
    client_secret: paymentIntent.client_secret!,
    status: paymentIntent.status,
    mock: false,
  };
}
