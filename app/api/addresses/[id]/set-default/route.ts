import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { addresses } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// PUT /api/addresses/[id]/set-default — mark an address as default
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, session.user.id)))
      .get();

    if (!existing) {
      return NextResponse.json({ error: 'Address not found or unauthorized.' }, { status: 404 });
    }

    db.transaction((tx) => {
      // 1. Unset all defaults
      tx.update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, session.user.id))
        .run();

      // 2. Mark this one default
      tx.update(addresses)
        .set({ isDefault: true })
        .where(eq(addresses.id, id))
        .run();
    });

    return NextResponse.json({ success: true, message: 'Address set as default.' });
  } catch (error: any) {
    console.error('Error setting default address:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
