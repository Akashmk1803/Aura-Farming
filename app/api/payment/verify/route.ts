import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { sendWhatsAppOrderNotification } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      shipping_name,
      shipping_address,
      phone,
      payment_method,
      subtotal,
      convenienceFee,
      platformFee,
      deliveryFee,
      codFee,
      shippingFee,
      total,
      validatedItems
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Payment details missing.' }, { status: 400 });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
    }
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid Razorpay signature', { expectedSignature, razorpay_signature });
      return NextResponse.json({ error: 'Invalid signature. Payment tampering detected.' }, { status: 400 });
    }

    // Retrieve session user
    const session = await auth.api.getSession({
      headers: await headers()
    });
    const userId = session?.user?.id || null;

    const orderId = 'AURA-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const itemsSummary = validatedItems.map((item: any) => `${item.name} (${item.size}) x${item.quantity}`).join(', ');

    // ─── Asynchronous DB transaction ─────────────────────────────────
    await db.transaction(async (tx) => {
      await tx.insert(orders).values({
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
        status: 'paid', // verified prepaid
        paymentMethod: payment_method,
        paymentGatewayOrderId: razorpay_order_id,
      }).run();

      for (const item of validatedItems) {
        await tx.insert(orderItems).values({
          orderId,
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        }).run();

        // Atomically decrement stock
        await tx.run(sql`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.productId}`);
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
      { success: true, orderId, status: 'paid' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error during payment verification:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
