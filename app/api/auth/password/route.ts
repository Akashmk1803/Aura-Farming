import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { account } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

// Verify a password against a stored Better Auth scrypt hash  ("salt:key" format)
function verifyPasswordSync(plain: string, stored: string): boolean {
  const [salt, keyHex] = stored.split(':');
  if (!salt || !keyHex) return false;
  const storedKey = Buffer.from(keyHex, 'hex');
  const derivedKey = scryptSync(plain.normalize('NFKC'), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return timingSafeEqual(storedKey, derivedKey);
}

// Hash a new password in Better Auth scrypt format ("salt:key")
function hashPasswordSync(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(plain.normalize('NFKC'), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${key.toString('hex')}`;
}

// PUT /api/auth/password — change password after verifying current password
export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { current_password, new_password } = await req.json();

    if (!current_password || !new_password) {
      return NextResponse.json({ error: 'Both current and new password are required.' }, { status: 400 });
    }

    if (new_password.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    }

    // Fetch the stored credential account for this user
    const credential = db
      .select()
      .from(account)
      .where(eq(account.userId, session.user.id))
      .get();

    if (!credential?.password) {
      return NextResponse.json({ error: 'No password credential found for this account.' }, { status: 400 });
    }

    // Verify current password
    const isCorrect = verifyPasswordSync(current_password, credential.password);
    if (!isCorrect) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 403 });
    }

    // Hash and store the new password
    const newHash = hashPasswordSync(new_password);
    db.update(account)
      .set({ password: newHash, updatedAt: new Date() })
      .where(eq(account.userId, session.user.id))
      .run();

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    console.error('[password update error]', err);
    return NextResponse.json({ error: err.message || 'Password update failed' }, { status: 500 });
  }
}
