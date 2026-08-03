import { NextResponse } from 'next/server';
import { db } from '@/db';
import { coupons, couponUsages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const activeCoupons = await db
      .select()
      .from(coupons)
      .where(eq(coupons.isActive, true))
      .all();

    // Default to the highest percentage coupon
    const bestCoupon = activeCoupons.sort((a, b) => b.discountValue - a.discountValue)[0] || null;

    let showWelcomePopup = false;

    if (session?.user && bestCoupon) {
      // Check if user has already seen the welcome popup for ANY coupon
      const usage = await db
        .select()
        .from(couponUsages)
        .where(
          and(
            eq(couponUsages.userId, session.user.id),
            eq(couponUsages.isWelcomePopupShown, true)
          )
        )
        .get();

      if (!usage) {
        showWelcomePopup = true;
      }
    }

    return NextResponse.json({
      success: true,
      bestCoupon,
      showWelcomePopup,
      allActive: activeCoupons,
    });
  } catch (error: any) {
    console.error('Active coupons fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch active coupons.' }, { status: 500 });
  }
}
