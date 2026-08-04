import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const list = await db.select().from(products).all();
    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Quick validation
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = body.id || randomUUID().substring(0, 8).toUpperCase();

    const newProduct = {
      id,
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

    await db.insert(products).values(newProduct);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
