import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { coupons, couponUsages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

import { calculateDiscount } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
    }

    const couponData = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).get();

    if (!couponData) {
      return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 404 });
    }

    if (!couponData.isActive) {
      return NextResponse.json({ error: 'This coupon is no longer active.' }, { status: 400 });
    }

    if (couponData.expiryDate && new Date() > couponData.expiryDate) {
      return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
    }

    if (subtotal < couponData.minOrderValue) {
      return NextResponse.json({ error: `Minimum order value of ₹${couponData.minOrderValue} required.` }, { status: 400 });
    }

    if (couponData.usageLimit || couponData.isOneTime) {
      const usages = await db.select().from(couponUsages).where(eq(couponUsages.couponCode, code.toUpperCase())).all();
      
      if (couponData.usageLimit && usages.filter(u => u.orderId).length >= couponData.usageLimit) {
        return NextResponse.json({ error: 'This coupon has reached its usage limit.' }, { status: 400 });
      }

      if (couponData.isOneTime) {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
          return NextResponse.json({ error: 'You must be logged in to use this coupon.' }, { status: 401 });
        }
        const hasUsed = usages.some(u => u.userId === session.user.id && u.orderId);
        if (hasUsed) {
          return NextResponse.json({ error: 'You have already used this coupon.' }, { status: 400 });
        }
      }
    }

    const discount = calculateDiscount(subtotal, couponData);

    return NextResponse.json({
      success: true,
      coupon: couponData,
      discount,
    });
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Failed to validate coupon.' }, { status: 500 });
  }
}
