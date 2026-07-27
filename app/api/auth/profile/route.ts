import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT /api/auth/profile — update name and shipping address
export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { full_name, shipping_address } = await req.json();

    if (!full_name || typeof full_name !== 'string' || full_name.trim().length === 0) {
      return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
    }

    const trimmedName = full_name.trim();
    const trimmedAddress = (shipping_address ?? '').trim();

    // Update user row via Drizzle
    await db
      .update(user)
      .set({
        name: trimmedName,
        shippingAddress: trimmedAddress,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({
      full_name: trimmedName,
      shipping_address: trimmedAddress,
    });
  } catch (err: any) {
    console.error('[profile update error]', err);
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}
