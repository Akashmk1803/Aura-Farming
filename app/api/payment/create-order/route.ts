import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Razorpay from 'razorpay';

// ─── Fee constants (must mirror the UI's order summary exactly) ──────────────
const CONVENIENCE_FEE = 20;
const PLATFORM_FEE = 23;
const DELIVERY_FEE_PREPAID = 0;

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required.' }, { status: 400 });
    }

    // Retrieve session user
    const session = await auth.api.getSession({
      headers: await headers()
    });
    const userId = session?.user?.id || 'guest';

    // ─── Synchronous stock validation & subtotal ────────────────────
    let subtotal = 0;
    const validatedItems = [];

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

    const convenienceFee = CONVENIENCE_FEE;
    const platformFee = PLATFORM_FEE;
    const deliveryFee = DELIVERY_FEE_PREPAID;
    const total = subtotal + convenienceFee + platformFee + deliveryFee;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    console.log('[Razorpay Init] Key ID present:', !!keyId, 'Length:', keyId?.length);
    console.log('[Razorpay Init] Key Secret present:', !!keySecret, 'Length:', keySecret?.length);

    // ─── Initialize Razorpay Order ────────────────────
    const razorpay = new Razorpay({
      key_id: keyId!,
      key_secret: keySecret!,
    });

    const receiptId = 'RCPT-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const orderOptions = {
      amount: total * 100, // amount in paise
      currency: 'INR',
      receipt: receiptId,
      notes: {
        userId,
      }
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    return NextResponse.json(
      {
        razorpayOrderId: razorpayOrder.id,
        subtotal,
        convenienceFee,
        platformFee,
        deliveryFee,
        codFee: 0,
        shippingFee: deliveryFee,
        total,
        validatedItems,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
  }
}
