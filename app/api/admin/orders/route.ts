import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const list = await db.select({
      id: orders.id,
      userId: orders.userId,
      shippingName: orders.shippingName,
      shippingAddress: orders.shippingAddress,
      subtotal: orders.subtotal,
      convenienceFee: orders.convenienceFee,
      platformFee: orders.platformFee,
      deliveryFee: orders.deliveryFee,
      codFee: orders.codFee,
      shippingFee: orders.shippingFee,
      total: orders.total,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      refundAmount: orders.refundAmount,
      phone: orders.phone,
      createdAt: orders.createdAt,
      paymentGatewayOrderId: orders.paymentGatewayOrderId,
      couponCode: orders.couponCode,
      discountAmount: orders.discountAmount,
      email: user.email
    })
    .from(orders)
    .leftJoin(user, eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt))
    .all();

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
