import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  try {
    const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order) {
      return NextResponse.json({ error: 'Order coordinates not found.' }, { status: 404 });
    }

    let simulatedStatus = order.status;
    if (order.status === 'paid' && order.createdAt) {
      const createdAtStr = order.createdAt.endsWith('Z') ? order.createdAt : order.createdAt + ' UTC';
      const elapsedMs = Date.now() - new Date(createdAtStr).getTime();
      const elapsedSec = elapsedMs / 1000;
      if (elapsedSec > 180) {
        simulatedStatus = 'delivered';
      } else if (elapsedSec > 90) {
        simulatedStatus = 'out_for_delivery';
      } else if (elapsedSec > 30) {
        simulatedStatus = 'shipped';
      }
    }

    const items = await db.select({
      productId: orderItems.productId,
      size: orderItems.size,
      quantity: orderItems.quantity,
      price: orderItems.price,
      name: products.name,
      artSvgKey: products.artSvgKey
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId))
    .all();

    return NextResponse.json({
      id: order.id,
      user_id: order.userId,
      shipping_name: order.shippingName,
      shipping_address: order.shippingAddress,
      subtotal: order.subtotal,
      shipping_fee: order.shippingFee,
      total: order.total,
      status: simulatedStatus,
      created_at: order.createdAt,
      paymentMethod: order.paymentMethod,
      refundAmount: order.refundAmount,
      items
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
