import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wishlist, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch user's wishlist items joined with product details
    const items = await db.select({
      id: products.id,
      name: products.name,
      desc: products.description,
      price: products.price,
      cat: products.category,
      catLabel: products.categoryLabel,
      art: products.artSvgKey,
      stock: products.stock,
      size: wishlist.size
    })
    .from(wishlist)
    .innerJoin(products, eq(wishlist.productId, products.id))
    .where(eq(wishlist.userId, userId))
    .all();

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { productId, size = 'M' } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    // Check if item is already in wishlist
    const existing = await db.select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))
      .get();

    if (existing) {
      // Remove it
      await db.delete(wishlist)
        .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))
        .run();
      return NextResponse.json({ active: false, message: 'Removed from wishlist' });
    } else {
      // Add it
      await db.insert(wishlist)
        .values({
          userId,
          productId,
          size
        })
        .run();
      return NextResponse.json({ active: true, message: 'Added to wishlist' });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
