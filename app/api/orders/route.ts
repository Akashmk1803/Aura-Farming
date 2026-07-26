import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { shipping_name, shipping_address, items } = await req.json();

    if (!shipping_name || !shipping_address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Shipping details and items are required.' }, { status: 400 });
    }

    // Retrieve session user using Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });
    const userId = session?.user?.id || null;

    const orderId = 'AURA-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // ─── PHASE 1: Synchronous stock validation & total calculation ───────────
    // better-sqlite3 transactions are SYNCHRONOUS — no await allowed inside.
    // Validate everything first, outside the transaction.
    let subtotal = 0;
    const validatedItems: {
      productId: string;
      quantity: number;
      size: string;
      price: number;
      name: string;
    }[] = [];

    for (const item of items) {
      const product = db.select().from(products).where(eq(products.id, item.productId)).get();
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Only ${product.stock} left.` },
          { status: 409 }
        );
      }
      subtotal += product.price * item.quantity;
      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        price: product.price,
        name: product.name,
      });
    }

    const shippingFee = subtotal >= 4999 ? 0 : 199;
    const total = subtotal + shippingFee;

    // ─── PHASE 2: Async Stripe call (outside the transaction) ────────────────
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: total * 100, // Stripe expects amount in paise (INR)
        currency: 'inr',
        metadata: {
          orderId,
          userId: userId || 'guest',
        },
        description: `Aura Farming checkout: ${orderId}`,
      });
    } catch (stripeErr: any) {
      console.error('Stripe PaymentIntent creation failed:', stripeErr);
      return NextResponse.json(
        { error: `Payment gateway error: ${stripeErr.message}` },
        { status: 502 }
      );
    }

    // ─── PHASE 3: Synchronous DB transaction (no async, no await) ────────────
    db.transaction((tx) => {
      tx.insert(orders).values({
        id: orderId,
        userId,
        shippingName: shipping_name,
        shippingAddress: shipping_address,
        subtotal,
        shippingFee,
        total,
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
      }).run();

      for (const item of validatedItems) {
        tx.insert(orderItems).values({
          orderId,
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        }).run();

        // Atomically decrement stock
        tx.run(sql`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.productId}`);
      }
    });

    return NextResponse.json(
      { orderId, subtotal, shippingFee, total, clientSecret: paymentIntent.client_secret, status: 'pending' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error during checkout transaction:', error);
    return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
  }
}
