import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { coupons, couponUsages } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { desc, eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const list = await db.select().from(coupons).orderBy(desc(coupons.createdAt)).all();
    const usages = await db.select().from(couponUsages).all();

    const result = list.map(c => {
      const usageCount = usages.filter(u => u.couponCode === c.code && u.orderId).length;
      return { ...c, usageCount };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching admin coupons:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Ensure code is uppercase and no spaces
    const code = (body.code || '').toUpperCase().trim();
    if (!code) return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });

    const existing = await db.select().from(coupons).where(eq(coupons.code, code)).get();
    if (existing) return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });

    await db.insert(coupons).values({
      code,
      discountType: body.discountType,
      discountValue: parseInt(body.discountValue) || 0,
      minOrderValue: parseInt(body.minOrderValue) || 0,
      maxDiscount: body.maxDiscount ? parseInt(body.maxDiscount) : null,
      isActive: body.isActive !== undefined ? body.isActive : true,
      isOneTime: body.isOneTime !== undefined ? body.isOneTime : false,
      isWelcome: body.isWelcome !== undefined ? body.isWelcome : false,
      usageLimit: body.usageLimit ? parseInt(body.usageLimit) : null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      description: body.description || '',
    });

    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
