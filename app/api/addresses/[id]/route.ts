import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { addresses } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// PUT /api/addresses/[id] — update an existing address
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

    const {
      name,
      mobile,
      whatsappNumber,
      pinCode,
      locality,
      flatNumber,
      landmark,
      city,
      district,
      state,
      addressType,
      isDefault
    } = await req.json();

    if (!name || !mobile || !pinCode || !locality || !flatNumber || !landmark || !city || !district || !state || !addressType) {
      return NextResponse.json({ error: 'Missing required address fields.' }, { status: 400 });
    }

    // Verify address ownership
    const existing = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, session.user.id)))
      .get();

    if (!existing) {
      return NextResponse.json({ error: 'Address not found or unauthorized.' }, { status: 404 });
    }

    await db.transaction(async (tx) => {
      if (isDefault) {
        // Unset any previous defaults for this user
        await tx.update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, session.user.id))
          .run();
      }

      await tx.update(addresses)
        .set({
          name,
          mobile,
          whatsappNumber: whatsappNumber || null,
          pinCode,
          locality,
          flatNumber,
          landmark,
          city,
          district,
          state,
          addressType,
          isDefault: isDefault ?? existing.isDefault,
        })
        .where(eq(addresses.id, id))
        .run();
    });

    const updated = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, id))
      .get();

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
