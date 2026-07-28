import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import path from 'path';
import * as schema from './schema';
import { randomBytes, scryptSync } from 'node:crypto';
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

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

// ============================================================================
// DATABASE CONNECTION
// ============================================================================
const localDbPath = path.join(process.cwd(), 'database.db');
const url = process.env.TURSO_DATABASE_URL || `file:${localDbPath}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });
export const db = drizzle(client, { schema });

const isTurso = url.startsWith('libsql://') || url.startsWith('https://');

if (!isTurso) {
  // Legacy SQLite Initialization
  const Database = require('better-sqlite3');
  const sqlite = new Database(localDbPath);

  // ============================================================================
  // SCHEMA INITIALIZATION
  // ============================================================================
  // Sync creation of tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      category TEXT NOT NULL,
      category_label TEXT NOT NULL,
      art_svg_key TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 50,
      is_limited INTEGER NOT NULL DEFAULT 0,
      is_customizable INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      emailVerified INTEGER NOT NULL,
      image TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      role TEXT DEFAULT 'user',
      shippingAddress TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      expiresAt INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      userId TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES user(id)
    );

    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      accountId TEXT NOT NULL,
      providerId TEXT NOT NULL,
      userId TEXT NOT NULL,
      accessToken TEXT,
      refreshToken TEXT,
      idToken TEXT,
      expiresAt INTEGER,
      password TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY(userId) REFERENCES user(id)
    );

    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expiresAt INTEGER NOT NULL,
      createdAt INTEGER,
      updatedAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      shipping_name TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      convenience_fee INTEGER NOT NULL DEFAULT 0,
      platform_fee INTEGER NOT NULL DEFAULT 0,
      delivery_fee INTEGER NOT NULL DEFAULT 0,
      cod_fee INTEGER NOT NULL DEFAULT 0,
      shipping_fee INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      payment_gateway_order_id TEXT,
      FOREIGN KEY(user_id) REFERENCES user(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES user(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
  `);

  // ============================================================================
  // SAFE ALTER TABLE MIGRATIONS
  // ============================================================================
  // ── Safe migrations: add new columns to existing databases without wiping data ──
  // SQLite throws if a column already exists; we catch and ignore those errors.
  try { sqlite.exec(`ALTER TABLE products ADD COLUMN is_limited INTEGER NOT NULL DEFAULT 0`); } catch {}
  try { sqlite.exec(`ALTER TABLE products ADD COLUMN is_customizable INTEGER NOT NULL DEFAULT 0`); } catch {}
  try { sqlite.exec(`ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'card'`); } catch {}
  try { sqlite.exec(`ALTER TABLE orders ADD COLUMN refund_amount INTEGER`); } catch {}
  try { sqlite.exec(`ALTER TABLE orders ADD COLUMN phone TEXT DEFAULT '' NOT NULL`); } catch {}
  // Fee breakdown columns — added after initial schema, safe to re-run
  try { sqlite.exec(`ALTER TABLE orders ADD COLUMN convenience_fee INTEGER NOT NULL DEFAULT 0`); } catch {}
  try { sqlite.exec(`ALTER TABLE orders ADD COLUMN platform_fee INTEGER NOT NULL DEFAULT 0`); } catch {}
  try { sqlite.exec(`ALTER TABLE orders ADD COLUMN delivery_fee INTEGER NOT NULL DEFAULT 0`); } catch {}
  try { sqlite.exec(`ALTER TABLE orders ADD COLUMN cod_fee INTEGER NOT NULL DEFAULT 0`); } catch {}
  try { sqlite.exec(`ALTER TABLE wishlist ADD COLUMN size TEXT NOT NULL DEFAULT 'M'`); } catch {}
  // Rename stripe_payment_intent_id to payment_gateway_order_id if it exists
  try { sqlite.exec(`ALTER TABLE orders RENAME COLUMN stripe_payment_intent_id TO payment_gateway_order_id`); } catch {}
  // Create addresses table if not exists
  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS addresses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        whatsapp_number TEXT,
        pin_code TEXT NOT NULL,
        locality TEXT NOT NULL,
        flat_number TEXT NOT NULL,
        landmark TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        address_type TEXT NOT NULL,
        is_default INTEGER NOT NULL DEFAULT 0,
        district TEXT NOT NULL DEFAULT ''
      )
    `);
  } catch {}

  try { sqlite.exec(`ALTER TABLE addresses ADD COLUMN district TEXT NOT NULL DEFAULT ''`); } catch {}

  // Backfill is_customizable=1 for hoodies, tees, longsleeve in existing seeded rows
  sqlite.exec(`UPDATE products SET is_customizable = 1 WHERE category IN ('hoodies', 'tees') AND is_customizable = 0`);
  // Mark Crimson Line Jacket as limited
  sqlite.exec(`UPDATE products SET is_limited = 1, stock = 12 WHERE id = 'C' AND is_limited = 0`);
}
