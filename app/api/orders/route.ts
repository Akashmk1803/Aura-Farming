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

    let subtotal = 0;
    const orderId = 'AURA-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const validatedItems: {
      productId: string;
      quantity: number;
      size: string;
      price: number;
      name: string;
    }[] = [];

    // Wrap checkout operations in a Drizzle database transaction
    const orderResult = await db.transaction(async (tx) => {
      // 1. Validate stock and calculate subtotal
      for (const item of items) {
        const product = tx.select().from(products).where(eq(products.id, item.productId)).get();
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} items left.`);
        }

        subtotal += product.price * item.quantity;
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          price: product.price,
          name: product.name
        });
      }

      const shippingFee = subtotal >= 4999 ? 0 : 199;
      const total = subtotal + shippingFee;

      // 2. Create Stripe PaymentIntent
      let paymentIntent;
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: total * 100, // Stripe expects amount in paise (INR)
          currency: 'inr',
          metadata: {
            orderId: orderId,
            userId: userId || 'guest'
          },
          description: `Aura Farming checkout: ${orderId}`
        });
      } catch (stripeErr: any) {
        console.error('Stripe PaymentIntent creation failed:', stripeErr);
        throw new Error(`Payment gateway error: ${stripeErr.message}`);
      }

      // 3. Create order entry in SQLite
      tx.insert(orders).values({
        id: orderId,
        userId: userId,
        shippingName: shipping_name,
        shippingAddress: shipping_address,
        subtotal: subtotal,
        shippingFee: shippingFee,
        total: total,
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id
      }).run();

      // 4. Create items entries and update stock
      for (const item of validatedItems) {
        tx.insert(orderItems).values({
          orderId: orderId,
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.price
        }).run();

        // Atomically decrement stock
        tx.run(sql`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.productId}`);
      }

      return {
        orderId,
        subtotal,
        shippingFee,
        total,
        clientSecret: paymentIntent.client_secret,
        status: 'pending'
      };
    });

    return NextResponse.json(orderResult, { status: 201 });
  } catch (error: any) {
    console.error('Error during checkout transaction:', error);
    return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 400 });
  }
}
