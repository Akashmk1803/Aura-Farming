import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, products, orderItems } from '@/db/schema';
import { desc, sql, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Administrators only.' }, { status: 403 });
    }

    const totalSalesRow = await db.select({
      total: sql<number>`SUM(total)`
    }).from(orders).get();

    const totalOrdersRow = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(orders).get();

    const totalSales = totalSalesRow?.total || 0;
    const totalOrders = totalOrdersRow?.count || 0;

    const allProducts = await db.select({
      id: products.id,
      name: products.name,
      stock: products.stock,
      price: products.price
    }).from(products).all();

    const salesByProduct = await db.select({
      productId: orderItems.productId,
      name: products.name,
      totalQty: sql<number>`SUM(${orderItems.quantity})`,
      totalRevenue: sql<number>`SUM(${orderItems.quantity} * ${orderItems.price})`
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .groupBy(orderItems.productId)
    .orderBy(desc(sql`SUM(${orderItems.quantity})`))
    .all();

    const allOrdersRaw = await db.select().from(orders).orderBy(desc(orders.createdAt)).all();

    // Attach order items (name, size, qty) to each order for the admin order card product summary
    const allOrders = [];
    for (const order of allOrdersRaw) {
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
      allOrders.push({ ...order, items });
    }

    return NextResponse.json({
      totalSales,
      totalOrders,
      products: allProducts,
      orders: allOrders,
      salesByProduct
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
