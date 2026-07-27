import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Access denied. Please log in.' }, { status: 401 });
    }

    const list = await db.select()
      .from(orders)
      .where(eq(orders.userId, session.user.id))
      .orderBy(desc(orders.createdAt))
      .all();

    const ordersWithItems = [];
    for (const order of list) {
      const items = await db.select({
        id: orderItems.id,
        productId: orderItems.productId,
        size: orderItems.size,
        quantity: orderItems.quantity,
        price: orderItems.price,
        name: products.name,
        artSvgKey: products.artSvgKey
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id))
      .all();

      ordersWithItems.push({
        ...order,
        items
      });
    }

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
