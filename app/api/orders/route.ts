import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { createPaymentIntent } from '@/lib/payment';
import { sendWhatsAppOrderNotification } from '@/lib/whatsapp';

const PREPAID_METHODS = ['card', 'upi'];

// ─── Fee constants (must mirror the UI's order summary exactly) ──────────────
// Card/UPI: 20 + 0 + 23 + 0  = ₹43 extra
// COD:      20 + 137 + 23 + 19 = ₹199 extra
const CONVENIENCE_FEE = 20;
const PLATFORM_FEE = 23;
const DELIVERY_FEE_PREPAID = 0;
const DELIVERY_FEE_COD = 137;
const COD_FEE_CHARGE = 19;

export async function POST(req: NextRequest) {
  try {
    const { shipping_name, shipping_address, phone, items, payment_method = 'card' } = await req.json();

    if (!shipping_name || !shipping_address || !phone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Shipping details, phone number, and items are required.' }, { status: 400 });
    }

    // Retrieve session user using Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });
    const userId = session?.user?.id || null;

    const orderId = 'AURA-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // ─── PHASE 1: Synchronous stock validation & subtotal ────────────────────
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

    // ─── Fee breakdown (mirrored exactly from UI OrderSummary) ───────────────
    const isCOD = payment_method === 'cod';
    const isPrepaid = PREPAID_METHODS.includes(payment_method);

    const convenienceFee = CONVENIENCE_FEE;
    const platformFee = PLATFORM_FEE;
    const deliveryFee = isCOD ? DELIVERY_FEE_COD : DELIVERY_FEE_PREPAID;
    const codFee = isCOD ? COD_FEE_CHARGE : 0;
    const shippingFee = deliveryFee; // legacy compat column

    const total = subtotal + convenienceFee + platformFee + deliveryFee + codFee;

    const itemsSummary = validatedItems.map(item => `${item.name} (${item.size}) x${item.quantity}`).join(', ');

    // ─── PHASE 2 (COD): skip payment intent, go straight to confirmation ─────
    if (isCOD) {
      db.transaction((tx) => {
        tx.insert(orders).values({
          id: orderId,
          userId,
          shippingName: shipping_name,
          shippingAddress: shipping_address,
          phone,
          subtotal,
          convenienceFee,
          platformFee,
          deliveryFee,
          codFee,
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

      // Fire WhatsApp notification trigger for COD order
      try {
        await sendWhatsAppOrderNotification(phone, {
          orderId,
          itemsSummary,
          total,
          paymentMethod: 'cod',
          shippingAddress: shipping_address,
          recipientName: shipping_name
        });
      } catch (waError) {
        console.error('Failed to trigger WhatsApp notification for COD:', waError);
      }

      return NextResponse.json(
        { orderId, subtotal, convenienceFee, platformFee, deliveryFee, codFee, shippingFee, total, cod: true, status: 'pending_cod' },
        { status: 201 }
      );
    }

    // ─── PHASE 2 (prepaid): create payment intent (real Stripe or mock) ──────
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

    // ─── PHASE 3: Synchronous DB transaction ─────────────────────────────────
    db.transaction((tx) => {
      tx.insert(orders).values({
        id: orderId,
        userId,
        shippingName: shipping_name,
        shippingAddress: shipping_address,
        phone,
        subtotal,
        convenienceFee,
        platformFee,
        deliveryFee,
        codFee,
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

    // Fire WhatsApp notification trigger for prepaid order
    try {
      await sendWhatsAppOrderNotification(phone, {
        orderId,
        itemsSummary,
        total,
        paymentMethod: payment_method,
        shippingAddress: shipping_address,
        recipientName: shipping_name
      });
    } catch (waError) {
      console.error('Failed to trigger WhatsApp notification for prepaid:', waError);
    }

    return NextResponse.json(
      { orderId, subtotal, convenienceFee, platformFee, deliveryFee, codFee, shippingFee, total, clientSecret: paymentIntent.client_secret, mock: paymentIntent.mock, status: paymentIntent.mock ? 'paid' : 'pending' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error during checkout transaction:', error);
    return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
  }
}
