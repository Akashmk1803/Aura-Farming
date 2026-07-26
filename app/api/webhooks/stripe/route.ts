import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event;
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error(`Webhook signature verification failed:`, err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
    } else {
      // Dev / E2E mock testing fallback
      console.warn('Stripe Webhook running in mock verification mode (missing secrets).');
      try {
        event = JSON.parse(body);
      } catch (err: any) {
        return NextResponse.json({ error: `JSON Parse Error: ${err.message}` }, { status: 400 });
      }
    }

    // Handle payment succeeded event
    const eventType = event.type;
    if (eventType === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        // Confirms order status to paid
        const result = await db.update(orders)
          .set({ status: 'paid' })
          .where(eq(orders.id, orderId))
          .run();

        console.log(`Payment confirmed for order: ${orderId}. Database status updated.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling Stripe webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
