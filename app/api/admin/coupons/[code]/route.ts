import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { coupons, couponUsages } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;
    const decodedCode = decodeURIComponent(code);
    const body = await req.json();

    const existing = await db.select().from(coupons).where(eq(coupons.code, decodedCode)).get();
    if (!existing) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });

    const updateData: any = {};
    if (body.discountType !== undefined) updateData.discountType = body.discountType;
    if (body.discountValue !== undefined) updateData.discountValue = parseInt(body.discountValue) || 0;
    if (body.minOrderValue !== undefined) updateData.minOrderValue = parseInt(body.minOrderValue) || 0;
    if (body.maxDiscount !== undefined) updateData.maxDiscount = body.maxDiscount ? parseInt(body.maxDiscount) : null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isOneTime !== undefined) updateData.isOneTime = body.isOneTime;
    if (body.isWelcome !== undefined) updateData.isWelcome = body.isWelcome;
    if (body.usageLimit !== undefined) updateData.usageLimit = body.usageLimit ? parseInt(body.usageLimit) : null;
    if (body.expiryDate !== undefined) updateData.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
    if (body.description !== undefined) updateData.description = body.description || '';

    if (Object.keys(updateData).length > 0) {
      await db.update(coupons).set(updateData).where(eq(coupons.code, decodedCode));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;
    const decodedCode = decodeURIComponent(code);

    const existing = await db.select().from(coupons).where(eq(coupons.code, decodedCode)).get();
    if (!existing) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });

    // Check if it's been used. If so, we should probably soft delete (isActive = false), but the prompt says Delete.
    // Drizzle will throw FK constraint if it's referenced in usages, unless we delete usages first or cascade.
    // Let's delete usages just in case, or just try to delete. Wait, the usage table has order_id, which we don't want to break.
    // Actually, `couponUsages` references `coupons.code`. We should delete the usages if we delete the coupon.
    await db.delete(couponUsages).where(eq(couponUsages.couponCode, decodedCode));
    await db.delete(coupons).where(eq(coupons.code, decodedCode));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
