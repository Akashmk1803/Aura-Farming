import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, coupons, couponUsages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Razorpay from 'razorpay';

import { calculateOrderSummary } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = body.items;
    const couponCode = body.couponCode;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required.' }, { status: 400 });
    }

    let couponData = null;
    if (couponCode) {
      couponData = await db.select().from(coupons).where(eq(coupons.code, couponCode)).get() || null;
    }

    // Retrieve session user
    const session = await auth.api.getSession({
      headers: await headers()
    });
    const userId = session?.user?.id || 'guest';

    if (couponData) {
      if (!couponData.isActive) {
        return NextResponse.json({ error: 'This coupon is no longer active.' }, { status: 400 });
      }

      if (couponData.expiryDate && new Date() > couponData.expiryDate) {
        return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
      }

      if (couponData.usageLimit || couponData.isOneTime) {
        const usages = await db.select().from(couponUsages).where(eq(couponUsages.couponCode, couponData.code)).all();
        
        if (couponData.usageLimit && usages.filter(u => u.orderId).length >= couponData.usageLimit) {
          return NextResponse.json({ error: 'This coupon has reached its usage limit.' }, { status: 400 });
        }

        if (couponData.isOneTime) {
          if (!session?.user) {
            return NextResponse.json({ error: 'You must be logged in to use this one-time coupon.' }, { status: 401 });
          }
          const hasUsed = usages.some(u => u.userId === session.user.id && u.orderId);
          if (hasUsed) {
            return NextResponse.json({ error: 'You have already used this coupon.' }, { status: 400 });
          }
        }
      }
    }

    // ─── Synchronous stock validation & subtotal ────────────────────
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await db.select().from(products).where(eq(products.id, item.productId)).get();
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ error: `Product ${product ? product.name : item.productId} unavailable or out of stock (only ${product?.stock || 0} left).` }, { status: 409 });
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

    const { subtotal: rawSubtotal, discount, convenienceFee, platformFee, deliveryFee, total } = calculateOrderSummary(validatedItems, false, couponData);

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
        subtotal: rawSubtotal,
        discount,
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
