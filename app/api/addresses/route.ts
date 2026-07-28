import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { addresses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET /api/addresses — list all saved addresses for the logged-in user
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAddresses = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, session.user.id))
      .all();

    return NextResponse.json(userAddresses);
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/addresses — save a new address
export async function POST(req: NextRequest) {
  try {
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

    const addressId = 'ADDR-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // If isDefault is true or this is the user's first address, mark it default
    const existingCount = (await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, session.user.id))
      .all()).length;

    const makeDefault = isDefault || existingCount === 0;

    await db.transaction(async (tx) => {
      if (makeDefault) {
        // Unset any previous defaults
        await tx.update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, session.user.id))
          .run();
      }

      await tx.insert(addresses)
        .values({
          id: addressId,
          userId: session.user.id,
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
          isDefault: makeDefault,
        })
        .run();
    });

    const saved = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, addressId))
      .get();

    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error saving address:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
