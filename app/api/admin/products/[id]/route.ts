import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;

    const updatedProduct = {
      name: body.name,
      description: body.description || '',
      price: Number(body.price),
      mrp: Number(body.mrp) || Number(body.price),
      category: body.category,
      categoryLabel: body.categoryLabel || body.category,
      artSvgKey: body.artSvgKey || 'tee',
      stock: Number(body.stock) || 0,
      isLimited: Boolean(body.isLimited),
      isCustomizable: Boolean(body.isCustomizable),
      status: body.status || 'in_stock',
      featured: Boolean(body.featured),
      imageUrl: body.imageUrl || null
    };

    await db.update(products).set(updatedProduct).where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
