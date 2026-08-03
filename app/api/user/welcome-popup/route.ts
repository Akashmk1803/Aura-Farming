import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { couponUsages } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { couponCode } = await req.json();

    if (!couponCode) {
      return NextResponse.json({ error: 'Coupon code required' }, { status: 400 });
    }

    await db.insert(couponUsages).values({
      userId: session.user.id,
      couponCode: couponCode,
      usedAt: new Date(),
      isWelcomePopupShown: true,
    }).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Welcome popup state error:', error);
    return NextResponse.json({ error: 'Failed to update popup state.' }, { status: 500 });
  }
}
