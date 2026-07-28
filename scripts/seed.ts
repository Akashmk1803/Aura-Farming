import { db } from '../db/index';
import * as schema from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { randomBytes, scryptSync } from 'node:crypto';

function hashPasswordSync(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password.normalize('NFKC'), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${key.toString('hex')}`;
}

async function seed() {
  console.log('🌱 Starting database seed...');

  // ============================================================================
  // PRODUCT SEEDING
  // ============================================================================
  const productCount = await db.select({ count: sql`count(*)` }).from(schema.products);
  
  if (Number(productCount[0].count) === 0) {
    const initialProducts = [
      { id: 'A', name: 'Brand of Aura Hoodie', description: 'Heavyweight 400 GSM fleece', price: 3499, category: 'hoodies', categoryLabel: 'Hoodie', artSvgKey: 'hoodie', stock: 50, isLimited: false, isCustomizable: true },
      { id: 'B', name: 'Sigil Oversized Tee', description: 'Boxy 240 GSM cotton', price: 1499, category: 'tees', categoryLabel: 'Tee', artSvgKey: 'tee', stock: 50, isLimited: false, isCustomizable: true },
      { id: 'C', name: 'Crimson Line Jacket', description: 'Coated shell, taped seams', price: 4999, category: 'outerwear', categoryLabel: 'Jacket', artSvgKey: 'jacket', stock: 12, isLimited: true, isCustomizable: false },
      { id: 'D', name: 'Void Cargo', description: 'Ripstop, eight pocket', price: 2799, category: 'bottoms', categoryLabel: 'Cargo', artSvgKey: 'cargo', stock: 50, isLimited: false, isCustomizable: false },
      { id: 'E', name: 'Marked Cap', description: 'Structured six panel', price: 999, category: 'headwear', categoryLabel: 'Cap', artSvgKey: 'cap', stock: 50, isLimited: false, isCustomizable: false },
      { id: 'F', name: 'Eclipse Longsleeve', description: 'Eclipse Longsleeve - Ribbed 260 GSM cotton', price: 1899, category: 'tees', categoryLabel: 'Longsleeve', artSvgKey: 'longsleeve', stock: 50, isLimited: false, isCustomizable: true }
    ];

    for (const p of initialProducts) {
      await db.insert(schema.products).values(p).onConflictDoNothing();
    }
    console.log('✅ Seeded initial products catalog.');
  } else {
    console.log('⏩ Products already exist, skipping product seed.');
  }

  // ============================================================================
  // ADMIN SEEDING
  // ============================================================================
  const adminEmail = 'admin@aurafarming.in';
  const adminPassword = 'adminpassword123';
  const adminHash = hashPasswordSync(adminPassword);
  
  const existingAdmin = await db.select().from(schema.user).where(eq(schema.user.email, adminEmail));

  if (existingAdmin.length === 0) {
    const userId = 'admin-user-id';
    
    await db.insert(schema.user).values({
      id: userId,
      name: 'Aura Administrator',
      email: adminEmail,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'admin',
      shippingAddress: ''
    }).onConflictDoNothing();

    await db.insert(schema.account).values({
      id: 'admin-account-id',
      accountId: adminEmail,
      providerId: 'credential',
      userId: userId,
      password: adminHash,
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoNothing();

    console.log(`✅ Seeded admin account: ${adminEmail}`);
  } else {
    // Check if password needs to be migrated to scrypt (Better Auth upgrade)
    const existingAccount = await db.select().from(schema.account).where(eq(schema.account.accountId, adminEmail));
    if (existingAccount.length > 0 && (!existingAccount[0].password || existingAccount[0].password.startsWith('$2'))) {
      await db.update(schema.account)
        .set({ password: adminHash, updatedAt: new Date() })
        .where(eq(schema.account.accountId, adminEmail));
      console.log(`✅ Updated admin account ${adminEmail} to Better Auth scrypt password hash`);
    } else {
      console.log(`⏩ Admin account already exists, skipping admin seed.`);
    }
  }

  console.log('✨ Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
