# AURA FARMING | Wear The Mark

> *Born Cursed. Worn Proud.*

**Aura Farming** is a premium dark-aesthetic e-commerce storefront built with Next.js App Router, Drizzle ORM, SQLite, Better Auth, and Stripe. It features animated SVG product art, a full checkout pipeline (Card / UPI / COD), real-time order tracking, a customization builder, wishlist sync, and an admin console — all in a single-page dark glassmorphic UI.

---

## Table of Contents

1. [Core Features](#-core-features)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Pre-Seeded Credentials](#-pre-seeded-credentials)
5. [Environment Variables](#-environment-variables)
6. [Installation & Local Run](#-installation--local-run)
7. [API Reference](#-api-reference)
8. [Database Schema](#-database-schema)
9. [What's Mocked vs Real](#-whats-mocked-vs-real)
10. [Database Operations](#-database-operations)
11. [Admin Access](#-admin-access)

---

## ✨ Core Features

| Feature | Status |
|---|---|
| Animated SVG garment catalogue (Hoodie, Tee, Longsleeve, Jacket, Cargo, Cap) | ✅ Real |
| Category tab filtering & search autocomplete | ✅ Real |
| Product detail modal with size selector (S/M/L/XL/XXL) | ✅ Real |
| Cart — localStorage, qty controls, cross-step persistence | ✅ Real |
| Wishlist — DB-persisted per user, size-synced | ✅ Real |
| Shipping address management (save, default, multi-address) | ✅ Real |
| Card checkout (Mock form or Real Stripe Elements) | ⚠️ Mocked by default |
| UPI checkout (form + QR) | ⚠️ Fully simulated — no real collection |
| Cash on Delivery checkout | ✅ Real — order created, cash on delivery |
| Pay Confirmation Modal (pre-submit review) | ✅ Real |
| Double-submit prevention (ref lock + 15s backend dedup) | ✅ Real |
| Order tracking timeline (per-status visual) | ✅ Real |
| Customer order history (Marked Lineage) — grouped by date | ✅ Real |
| Admin Console (stats, status override, restock) | ✅ Real — secret `Shift+A` |
| Customize Builder (`/customize-builder`) | ✅ Real SVG renderer |
| WhatsApp order notification | ⚠️ Mocked to console.log |
| Email verification on registration | ⚠️ Mocked to terminal by default |
| Refund calculation on returns | ✅ Calculated — no Stripe reversal yet |

---

## 🛠 Tech Stack

```
Next.js 16 (App Router)   — Framework + API routes
React 19                  — UI
TypeScript 5              — Type safety
better-sqlite3 12         — SQLite database engine
Drizzle ORM 0.45          — Database query builder
better-auth 1.6           — Authentication (sessions, email verification)
Stripe SDK 22             — Payment gateway (mock or real)
Nodemailer 9              — Email (Gmail SMTP, mock by default)
Vanilla CSS               — All styling (globals.css, 43KB design system)
```

---

## 📁 Project Structure

```
aura-farming/
│
├── app/
│   ├── api/
│   │   ├── addresses/
│   │   │   └── route.ts          GET (list user addresses) | POST (save new address)
│   │   ├── admin/
│   │   │   ├── restock/
│   │   │   │   └── route.ts      POST — set product stock level (admin only)
│   │   │   ├── stats/
│   │   │   │   └── route.ts      GET — aggregated admin dashboard data (admin only)
│   │   │   └── update-status/
│   │   │       └── route.ts      POST — change order fulfillment status (admin only)
│   │   ├── auth/
│   │   │   └── [...auth]/
│   │   │       └── route.ts      ALL — better-auth catch-all handler
│   │   ├── orders/
│   │   │   └── route.ts          POST — main checkout: validate, create order, decrement stock
│   │   ├── products/
│   │   │   └── route.ts          GET — full product catalogue
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── route.ts      POST — Stripe payment_intent.succeeded handler
│   │   └── wishlist/
│   │       └── route.ts          GET (list) | POST (toggle add/remove) | PUT (update size)
│   │
│   ├── customize-builder/
│   │   └── page.tsx              /customize-builder — SVG garment customizer
│   ├── limited-drops/            (future expansion placeholder)
│   ├── globals.css               Design tokens, animations, all component styles
│   ├── layout.tsx                Root layout
│   ├── page.module.css           Page-level CSS module
│   └── page.tsx                  Main SPA — storefront, all drawers, checkout flow
│
├── db/
│   ├── index.ts                  SQLite connection, auto-table creation, product seeding, admin seeding
│   └── schema.ts                 Drizzle table schemas (products, user, orders, wishlist, addresses, etc.)
│
├── lib/
│   ├── auth.ts                   better-auth server config (email verification, role fields)
│   ├── auth-client.ts            better-auth React client
│   ├── email.ts                  Nodemailer email sender (mock or live mode)
│   ├── payment.ts                Stripe PaymentIntent creator (mock or real)
│   ├── stripe.ts                 Stripe SDK instance
│   └── whatsapp.ts               WhatsApp notification sender (mocked to console.log)
│
├── public/                       Static assets
├── .env                          Environment variables (see below)
├── database.db                   SQLite database file (auto-created)
├── package.json
└── tsconfig.json
```

---

## 🔑 Pre-Seeded Credentials

### Admin Account
| Field | Value |
|---|---|
| Email | `admin@aurafarming.in` |
| Password | `adminpassword123` |
| Access | Press `Shift + A` after logging in |

### Test Card (Mock/Stripe Sandbox)
| Field | Value |
|---|---|
| Card Number | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g. `12/29`) |
| CVC | Any 3 digits (e.g. `123`) |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root. All variables below:

```env
# ── Required ──────────────────────────────────────────────────────────────
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ── Payments ───────────────────────────────────────────────────────────────
# Set MOCK_PAYMENTS=true to skip real Stripe (order still created in DB)
MOCK_PAYMENTS=true

# Stripe keys — only needed if MOCK_PAYMENTS is not true
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."   # Required in production for webhook verification

# ── Email ──────────────────────────────────────────────────────────────────
# 'mock' → prints verification link to terminal (no SMTP needed)
# 'live' → sends real email via Gmail SMTP
EMAIL_VERIFICATION_MODE=mock

# Only needed if EMAIL_VERIFICATION_MODE=live
GMAIL_SMTP_USER="your-email@gmail.com"
GMAIL_SMTP_APP_PASSWORD="xxxx xxxx xxxx xxxx"

# ── WhatsApp (optional — currently mocked) ─────────────────────────────────
# Add these to enable real WhatsApp order notifications via Meta Cloud API
# WHATSAPP_ACCESS_TOKEN="..."
# WHATSAPP_PHONE_NUMBER_ID="..."
```

---

## 🚀 Installation & Local Run

### Prerequisites
- Node.js v18 or later
- npm

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Akashmk1803/Aura-Farming.git
cd Aura-Farming

# 2. Install dependencies
npm install

# 3. Create your .env (copy the template above, or use the existing .env)

# 4. Start the dev server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

> The database (`database.db`) is auto-created on first run.  
> Products and the admin account are auto-seeded if the DB is empty.  
> No manual migrations are needed.

---

## 📡 API Reference

All routes are under `/api/`. Auth-protected routes require a valid session cookie from better-auth.

| Method | Route | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/products` | No | Full product catalogue |
| `GET` | `/api/addresses` | User | List user's saved addresses |
| `POST` | `/api/addresses` | User | Save new shipping address |
| `GET` | `/api/wishlist` | User | List wishlist with product details + sizes |
| `POST` | `/api/wishlist` | User | Toggle product in/out of wishlist |
| `PUT` | `/api/wishlist` | User | Update saved size for wishlist item |
| `POST` | `/api/orders` | Optional* | Create order (checkout endpoint) |
| `POST` | `/api/webhooks/stripe` | Stripe sig | Handle payment_intent.succeeded |
| `GET` | `/api/admin/stats` | Admin | Aggregated sales/orders/stock data |
| `POST` | `/api/admin/update-status` | Admin | Change order fulfillment status |
| `POST` | `/api/admin/restock` | Admin | Set product stock level |
| `*` | `/api/auth/[...auth]` | — | better-auth internal handler |

*Orders can be placed without a session (guest), but the UI forces login before reaching checkout.

### Order Status Values

| Status | Meaning |
|---|---|
| `pending` | Created, payment not yet confirmed (prepaid Stripe) |
| `paid` | Payment confirmed by Stripe webhook |
| `pending_cod` | COD order placed — cash to be collected on delivery |
| `shipped` | Admin has dispatched |
| `out_for_delivery` | With last-mile courier |
| `delivered` | Successfully delivered |
| `returned` | Item returned; `refund_amount` computed (prepaid) |

---

## 🗄 Database Schema

SQLite — auto-provisioned, no manual migrations. Schema is defined in `db/schema.ts` and the initial `CREATE TABLE IF NOT EXISTS` block runs in `db/index.ts` on every server start.

### Core Tables

| Table | Purpose |
|---|---|
| `products` | Product catalogue (id, name, price, category, stock, flags) |
| `user` | User accounts with `role` field (`user` / `admin`) |
| `session` | Active sessions (better-auth managed) |
| `account` | Credential/OAuth account records (better-auth managed) |
| `verification` | Email verification tokens (better-auth managed) |
| `orders` | Placed orders with full fee breakdown and status |
| `order_items` | Line items per order (product, size, qty, price snapshot) |
| `wishlist` | User's saved products with chosen size |
| `addresses` | Saved shipping addresses per user |

### Key Relationships

```
user ──< orders         (one user, many orders)
user ──< wishlist       (one user, many wishlist entries)
user ──< addresses      (one user, many addresses)
orders ──< order_items  (one order, many line items)
products ──< order_items
products ──< wishlist
```

---

## ⚡ What's Mocked vs Real

| Feature | Real? | Notes |
|---|---|---|
| Card payment (Stripe) | ⚠️ MOCKED by default | Set `MOCK_PAYMENTS=false` + real Stripe keys to activate |
| UPI payment | ❌ FULLY SIMULATED | No real payment collection — needs Razorpay/Cashfree integration |
| COD order creation | ✅ REAL | Order created in DB; cash collected on delivery by courier |
| WhatsApp notification | ⚠️ CONSOLE ONLY | Payload logged to terminal; see `lib/whatsapp.ts` to wire real Meta API |
| Email verification | ⚠️ TERMINAL LINK | Set `EMAIL_VERIFICATION_MODE=live` + Gmail credentials to send real emails |
| Refund calculation | ✅ CALCULATED | Amount stored in DB; no Stripe refund API call fired yet |
| Admin stock override | ✅ REAL | Direct DB write via `/api/admin/restock` |
| Admin status override | ✅ REAL | Direct DB write via `/api/admin/update-status` |
| Order tracking timeline | ✅ REAL | Reads live order `status` field from DB |
| Wishlist size sync | ✅ REAL | `PUT /api/wishlist` persists size to DB |

---

## 🗃 Database Operations

### Engine
SQLite via `better-sqlite3`. Stored in `database.db` in the project root.

### Auto-Provisioning
All tables are created with `CREATE TABLE IF NOT EXISTS` inside `db/index.ts` when the server starts. No manual migration commands are needed.

### Auto-Seeding
On first run (empty products table):
- 6 products are inserted (Hoodie, Tee, Jacket, Cargo, Cap, Longsleeve)
- Admin account `admin@aurafarming.in` is created if not present

### Safe Migrations
Column additions that happened post-launch (e.g. `payment_method`, `cod_fee`, `size` on wishlist) are applied with `ALTER TABLE ... ADD COLUMN` inside try/catch blocks — they silently no-op if the column already exists.

### Manual DB Access (if needed)

```bash
# View recent orders
sqlite3 database.db "SELECT id, status, total, payment_method, created_at FROM orders ORDER BY created_at DESC LIMIT 10;"

# Promote a user to admin
sqlite3 database.db "UPDATE user SET role = 'admin' WHERE email = 'your@email.com';"

# Reset stock for a product
sqlite3 database.db "UPDATE products SET stock = 50 WHERE id = 'A';"
```

---

## 🛡 Admin Access

1. Log in with `admin@aurafarming.in` / `adminpassword123`
2. On the storefront, press **`Shift + A`**
3. The Admin Console Drawer opens with:
   - Total Sales, Orders, Average Order Value
   - Stock Override (select product → set new count)
   - Order Status Override (all orders, grouped by date — mark Shipped / Delivered / Returned)

> **Note:** To promote any other account to admin, run the SQL command above. There is no UI for role management.

---

*Aura Farming — Born Cursed. Worn Proud.*
