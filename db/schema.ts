import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  category: text('category').notNull(),
  categoryLabel: text('category_label').notNull(),
  artSvgKey: text('art_svg_key').notNull(),
  stock: integer('stock').default(50).notNull(),
  isLimited: integer('is_limited', { mode: 'boolean' }).default(false).notNull(),
  isCustomizable: integer('is_customizable', { mode: 'boolean' }).default(false).notNull(),
});

// Better Auth Tables
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  role: text('role').default('user'),
  shippingAddress: text('shippingAddress').default(''),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').unique().notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }),
});

// Orders & Order Items
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id),
  shippingName: text('shipping_name').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  subtotal: integer('subtotal').notNull(),
  // Fee breakdown — stored individually so admin/tracking views can display the full receipt
  convenienceFee: integer('convenience_fee').default(0).notNull(),
  platformFee: integer('platform_fee').default(0).notNull(),
  deliveryFee: integer('delivery_fee').default(0).notNull(),
  codFee: integer('cod_fee').default(0).notNull(),
  shippingFee: integer('shipping_fee').notNull(), // legacy col — equals deliveryFee, kept for compat
  total: integer('total').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'paid', 'pending_cod', 'shipped', 'out_for_delivery', 'delivered', 'returned'
  paymentMethod: text('payment_method').default('card'), // 'card', 'upi', 'cod'
  refundAmount: integer('refund_amount'), // set when status = 'returned' on prepaid orders
  phone: text('phone').default('').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  paymentGatewayOrderId: text('payment_gateway_order_id'),
});

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  size: text('size').notNull(),
  quantity: integer('quantity').notNull(),
  price: integer('price').notNull(),
});

export const wishlist = sqliteTable('wishlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  productId: text('product_id').notNull().references(() => products.id),
  size: text('size').default('M').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const addresses = sqliteTable('addresses', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  mobile: text('mobile').notNull(),
  whatsappNumber: text('whatsapp_number'),
  pinCode: text('pin_code').notNull(),
  locality: text('locality').notNull(),
  flatNumber: text('flat_number').notNull(),
  landmark: text('landmark').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  addressType: text('address_type').notNull(), // 'Home', 'Work', 'Others'
  isDefault: integer('is_default', { mode: 'boolean' }).default(false).notNull(),
});

