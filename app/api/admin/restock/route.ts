import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Administrators only.' }, { status: 403 });
    }

    const { productId, newStock } = await req.json();
    if (!productId || newStock === undefined) {
      return NextResponse.json({ error: 'Product ID and new stock value are required.' }, { status: 400 });
    }

    const result = await db.update(products)
      .set({ stock: newStock })
      .where(eq(products.id, productId))
      .run();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, productId, stock: newStock });
  } catch (error) {
    console.error('Error restocking product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
