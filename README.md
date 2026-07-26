# AURA FARMING | Wear The Mark

**Aura Farming** is a premium, high-aesthetic e-commerce experience designed with dark modes, glowing animations, glassmorphism filters, and dynamic SVG visualizers. Built using Next.js (App Router), Drizzle ORM, SQLite, Better Auth, and Stripe.

---

## 📖 Table of Contents
1. [Core Features](#-core-features)
2. [Folder & File Structure](#-folder--file-structure)
3. [Pre-Seeded Credentials](#-pre-seeded-credentials)
4. [Installation & Local Run Guide](#-installation--local-run-guide)
5. [Database Operations](#-database-operations)

---

## 🌟 Core Features

* **Garment Catalog & Category Filters**: Responsive catalog featuring animated SVG vector artwork for products.
* **Search Autocomplete & History**: Interactive search input displaying dynamic matches and saving recent queries in `localStorage`.
* **Persistent Wishlist Drawer**: Relocated inside the product detail view modal. Allows customers to flag favorites which persist across page refreshes via SQLite.
* **Admin Analytics Dashboard**: Glassmorphic stats console showing KPI widgets (Total Sales, Orders, AOV, Low Stock), glowing SVG sales trends graph, and top garments progress bars.
* **Visual Order tracking**: Custom Catmull-Rom SVG timeline visualizer displaying status intervals (`Pending` → `Processing` → `Dispatched` → `Delivered`) and dynamic estimated delivery counters.
* **Stripe Checkout integration**: Sandbox mode support for placing mockup credit card orders.

---

## 📁 Folder & File Structure

Below is an overview of the key folders and files in the repository:

```
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── restock/route.ts          # Restocks products inventory counts
│   │   │   ├── stats/route.ts            # Aggregates analytical reports & trend stats
│   │   │   └── update-status/route.ts    # Admin timeline status overrides
│   │   ├── auth/
│   │   │   └── [...auth]/route.ts        # Better Auth API middleware handler
│   │   ├── orders/
│   │   │   ├── my-orders/route.ts        # Fetches user order lineages
│   │   │   ├── track/[orderId]/route.ts  # Fetches order manifest tracking detail
│   │   │   └── route.ts                  # Generates checkout order records
│   │   ├── products/
│   │   │   ├── [id]/route.ts             # Fetches individual item details
│   │   │   └── route.ts                  # Fetches full catalog lists
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts           # Stripe webhook processing checkout events
│   │   └── wishlist/
│   │       └── route.ts                  # GET/POST handlers to favorites sync
│   ├── globals.css                       # CSS Design Tokens, animations, and modal rules
│   ├── layout.tsx                        # Root layout container
│   └── page.tsx                          # Primary React interactive Single-Page application
├── db/
│   ├── index.ts                          # Database connector & automatic SQLite table setup
│   └── schema.ts                         # SQLite Drizzle schema tables declarations
├── lib/
│   ├── auth-client.ts                    # Better Auth frontend authClient hook loader
│   ├── auth.ts                           # Better Auth backend server configurations
│   └── stripe.ts                         # Stripe SDK instance loader
├── public/                               # Static assets and graphics
├── .env                                  # Environment variables and API keys
├── database.db                           # SQLite database file
├── package.json                          # Dependencies and script declarations
└── tsconfig.json                         # TypeScript configuration file
```

---

## 🔑 Pre-Seeded Credentials

### 1. Admin Console Credentials
Log in with the administrative credentials to view the Admin Console metrics drawer:
* **Email**: `admin@aurafarming.in`
* **Password**: `adminpassword123`

### 2. Stripe Payment Sandbox
Use these Mock Card details in checkout inputs:
* **Card Number**: `4242 4242 4242 4242`
* **Expiry Date**: Any future month & year (e.g. `12/29`)
* **CVC / CVV**: Any 3 digits (e.g. `123`)
* **Zip / Postal Code**: Any 5 digits (e.g. `90210`)

---

## 🚀 Installation & Local Run Guide

### Prerequisite
Ensure you have **Node.js** (v18+) installed.

### 1. Install Dependencies
In your project terminal, run:
```bash
npm install
```

### 2. Configure Environment Variables
Confirm your `.env` contains the required keys. An example config looks like:
```env
BETTER_AUTH_SECRET="aurafarmingsecret1234567890abcdef"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🗄️ Database Operations

* **Database Engine**: The project uses **SQLite** stored locally in `database.db`.
* **Automatic Provisioning**: Database tables (including Drizzle auth schema, products, orders, and wishlist tables) are auto-provisioned at server start via `sqlite.exec()` inside [db/index.ts](file:///c:/Users/akash/OneDrive/Desktop/aURAAA/db/index.ts). No manual migrations are required.
* **Auto-Seeding**: The products catalog seeds initial garments automatically on startup if the tables are empty.
