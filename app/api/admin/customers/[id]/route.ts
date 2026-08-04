import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, orders, addresses, wishlist, products, couponUsages, orderItems } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Profile
    const customer = await db.select().from(user).where(eq(user.id, id)).get();
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    // Orders
    const customerOrders = await db.select().from(orders).where(eq(orders.userId, id)).orderBy(desc(orders.createdAt)).all();
    
    // Aggregate order data
    const validOrders = customerOrders.filter(o => o.status !== 'cancelled' && o.status !== 'returned');
    const lifetimeSpending = validOrders.reduce((sum, o) => sum + o.total, 0);

    // Addresses
    const customerAddresses = await db.select().from(addresses).where(eq(addresses.userId, id)).all();

    // Wishlist
    const customerWishlist = await db.select({
      id: wishlist.id,
      productId: wishlist.productId,
      size: wishlist.size,
      createdAt: wishlist.createdAt,
      name: products.name,
      price: products.price,
      imageUrl: products.imageUrl,
      artSvgKey: products.artSvgKey
    })
    .from(wishlist)
    .innerJoin(products, eq(wishlist.productId, products.id))
    .where(eq(wishlist.userId, id))
    .all();

    // Coupons Used
    const customerCoupons = await db.select().from(couponUsages).where(eq(couponUsages.userId, id)).all();

    return NextResponse.json({
      customer: { ...customer, totalOrders: customerOrders.length, lifetimeSpending },
      orders: customerOrders,
      addresses: customerAddresses,
      wishlist: customerWishlist,
      couponUsages: customerCoupons
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const customer = await db.select().from(user).where(eq(user.id, id)).get();
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    // Prevent removing the last admin or oneself? (Optional, but good practice). We'll allow it based on prompt, but just basic update.
    const updateData: any = {};
    if (body.role !== undefined) updateData.role = body.role;
    if (body.status !== undefined) updateData.status = body.status;

    if (Object.keys(updateData).length > 0) {
      await db.update(user).set(updateData).where(eq(user.id, id));
    }

    return NextResponse.json({ success: true, user: { ...customer, ...updateData } });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
