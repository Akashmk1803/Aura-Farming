import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'database.db');
const sqlite = new Database(dbPath);

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
    stock INTEGER NOT NULL DEFAULT 50
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
    shipping_fee INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    stripe_payment_intent_id TEXT,
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

export const db = drizzle(sqlite, { schema });

// Seed products if catalog is empty
const productCount = sqlite.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (productCount.count === 0) {
  const initialProducts = [
    { id: 'A', name: 'Brand of Aura Hoodie', description: 'Heavyweight 400 GSM fleece', price: 3499, category: 'hoodies', category_label: 'Hoodie', art_svg_key: 'hoodie', stock: 50 },
    { id: 'B', name: 'Sigil Oversized Tee', description: 'Boxy 240 GSM cotton', price: 1499, category: 'tees', category_label: 'Tee', art_svg_key: 'tee', stock: 50 },
    { id: 'C', name: 'Crimson Line Jacket', description: 'Coated shell, taped seams', price: 4999, category: 'outerwear', category_label: 'Jacket', art_svg_key: 'jacket', stock: 50 },
    { id: 'D', name: 'Void Cargo', description: 'Ripstop, eight pocket', price: 2799, category: 'bottoms', category_label: 'Cargo', art_svg_key: 'cargo', stock: 50 },
    { id: 'E', name: 'Marked Cap', description: 'Structured six panel', price: 999, category: 'headwear', category_label: 'Cap', art_svg_key: 'cap', stock: 50 },
    { id: 'F', name: 'Eclipse Longsleeve', description: 'Eclipse Longsleeve - Ribbed 260 GSM cotton', price: 1899, category: 'tees', category_label: 'Longsleeve', art_svg_key: 'longsleeve', stock: 50 }
  ];

  const insertProduct = sqlite.prepare(`
    INSERT OR IGNORE INTO products (id, name, description, price, category, category_label, art_svg_key, stock)
    VALUES (@id, @name, @description, @price, @category, @category_label, @art_svg_key, @stock)
  `);

  const transaction = sqlite.transaction((items) => {
    for (const p of items) {
      insertProduct.run(p);
    }
  });

  transaction(initialProducts);
  console.log('Seeded database with initial products catalog.');
}

// Seed default administrator if not present
const adminCheck = sqlite.prepare("SELECT * FROM user WHERE email = ?").get("admin@aurafarming.in");
if (!adminCheck) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('adminpassword123', salt);
  
  const userId = 'admin-user-id';
  sqlite.prepare(`
    INSERT OR IGNORE INTO user (id, name, email, emailVerified, createdAt, updatedAt, role, shippingAddress)
    VALUES (?, 'Aura Administrator', 'admin@aurafarming.in', 1, ?, ?, 'admin', '')
  `).run(userId, Date.now(), Date.now());

  sqlite.prepare(`
    INSERT OR IGNORE INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt)
    VALUES (?, ?, 'credential', ?, ?, ?, ?)
  `).run('admin-account-id', 'admin@aurafarming.in', userId, hash, Date.now(), Date.now());
  
  console.log("Seeded admin account admin@aurafarming.in with password adminpassword123");
}
