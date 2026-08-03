import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { coupons } from '@/db/schema';
import { eq } from 'drizzle-orm';
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
