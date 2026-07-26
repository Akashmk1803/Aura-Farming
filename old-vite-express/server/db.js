const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
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

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    shipping_address TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    shipping_name TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    shipping_fee INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
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
`);

// Seed products if table is empty
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();

if (productCount.count === 0) {
  const initialProducts = [
    { id: 'A', name: 'Brand of Aura Hoodie', description: 'Heavyweight 400 GSM fleece', price: 3499, category: 'hoodies', category_label: 'Hoodie', art_svg_key: 'hoodie', stock: 50 },
    { id: 'B', name: 'Sigil Oversized Tee', description: 'Boxy 240 GSM cotton', price: 1499, category: 'tees', category_label: 'Tee', art_svg_key: 'tee', stock: 50 },
    { id: 'C', name: 'Crimson Line Jacket', description: 'Coated shell, taped seams', price: 4999, category: 'outerwear', category_label: 'Jacket', art_svg_key: 'jacket', stock: 50 },
    { id: 'D', name: 'Void Cargo', description: 'Ripstop, eight pocket', price: 2799, category: 'bottoms', category_label: 'Cargo', art_svg_key: 'cargo', stock: 50 },
    { id: 'E', name: 'Marked Cap', description: 'Structured six panel', price: 999, category: 'headwear', category_label: 'Cap', art_svg_key: 'cap', stock: 50 },
    { id: 'F', name: 'Eclipse Longsleeve', description: 'Ribbed 260 GSM cotton', price: 1899, category: 'tees', category_label: 'Longsleeve', art_svg_key: 'longsleeve', stock: 50 }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, description, price, category, category_label, art_svg_key, stock)
    VALUES (@id, @name, @description, @price, @category, @category_label, @art_svg_key, @stock)
  `);

  const transaction = db.transaction((products) => {
    for (const p of products) {
      insertProduct.run(p);
    }
  });

  transaction(initialProducts);
  console.log('Seeded database with initial products catalog.');
}

// Migration: add role column to users table if missing
try {
  db.prepare("SELECT role FROM users LIMIT 1").get();
} catch (err) {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
  console.log("Migrated database: added role column to users table.");
}

// Seed default administrator if not present
const adminCheck = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@aurafarming.in");
if (!adminCheck) {
  const bcrypt = require('bcryptjs');
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('adminpassword123', salt);
  
  const insertAdmin = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, shipping_address, role)
    VALUES (?, ?, ?, '', 'admin')
  `);
  insertAdmin.run("admin@aurafarming.in", hash, "Aura Administrator");
  console.log("Seeded admin account admin@aurafarming.in with password adminpassword123");
}

module.exports = db;
