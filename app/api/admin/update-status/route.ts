import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const HANDLING_DEDUCTION = 40; // non-refundable handling fee for returns
const PREPAID_METHODS = ['card', 'upi'];

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Administrators only.' }, { status: 403 });
    }

    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required.' }, { status: 400 });
    }

    // Fetch current order to determine payment method and total for refund calc
    const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Calculate refund amount if marking a prepaid order as returned
    let refundAmount: number | null = null;
    if (status === 'returned' && PREPAID_METHODS.includes(order.paymentMethod ?? 'card')) {
      refundAmount = Math.max(0, order.total - HANDLING_DEDUCTION);
    }

    const updateData: Record<string, any> = { status };
    if (refundAmount !== null) {
      updateData.refundAmount = refundAmount;
    }

    const result = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .run();

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      orderId,
      status,
      ...(refundAmount !== null ? { refundAmount, refundNote: `Refund: ₹${refundAmount} (₹${order.total} paid − ₹${HANDLING_DEDUCTION} handling fee)` } : {})
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
