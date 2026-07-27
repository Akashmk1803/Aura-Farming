import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { createPaymentIntent } from '@/lib/payment';

const PREPAID_METHODS = ['card', 'upi'];
const COD_FEE = 199; // always charged for COD regardless of order total

export async function POST(req: NextRequest) {
  try {
    const { shipping_name, shipping_address, items, payment_method = 'card' } = await req.json();

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

    // ─── Shipping fee: FREE for prepaid (Card/UPI), ₹199 always for COD ────
    const isCOD = payment_method === 'cod';
    const isPrepaid = PREPAID_METHODS.includes(payment_method);
    const shippingFee = isCOD ? COD_FEE : 0; // prepaid = always free
    const total = subtotal + shippingFee;

    // ─── PHASE 2: COD path — skip payment intent ──────────────────────────
    if (isCOD) {
      db.transaction((tx) => {
        tx.insert(orders).values({
          id: orderId,
          userId,
          shippingName: shipping_name,
          shippingAddress: shipping_address,
          subtotal,
          shippingFee,
          total,
          status: 'pending_cod',
          paymentMethod: 'cod',
          stripePaymentIntentId: null,
        }).run();

        for (const item of validatedItems) {
          tx.insert(orderItems).values({
            orderId,
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          }).run();

          tx.run(sql`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.productId}`);
        }
      });

      return NextResponse.json(
        { orderId, subtotal, shippingFee, total, cod: true, status: 'pending_cod' },
        { status: 201 }
      );
    }

    // ─── PHASE 2 (prepaid): Payment intent (real Stripe or mock) ─────────
    let paymentIntent;
    try {
      paymentIntent = await createPaymentIntent(
        total * 100,
        { orderId, userId: userId || 'guest' },
        `Aura Farming checkout: ${orderId}`
      );
    } catch (stripeErr: any) {
      console.error('Payment intent creation failed:', stripeErr);
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
        status: paymentIntent.mock ? 'paid' : 'pending',
        paymentMethod: payment_method,
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
      { orderId, subtotal, shippingFee, total, clientSecret: paymentIntent.client_secret, mock: paymentIntent.mock, status: paymentIntent.mock ? 'paid' : 'pending' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error during checkout transaction:', error);
    return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
  }
}
