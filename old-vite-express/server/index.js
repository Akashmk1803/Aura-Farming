const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'AURA_SECRET_KEY_777';

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../dist')));

// Authentication Middleware
function authenticateToken(req, res, next) {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// Optional Authentication Middleware
function optionalAuthenticate(req, res, next) {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
  } catch (error) {
    req.user = null;
  }
  next();
}

// Admin Authentication Middleware
function requireAdmin(req, res, next) {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    if (verified.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrators only.' });
    }
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// Routes - Products
// Get all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a single product
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Routes - Authentication
// Register User
app.post('/api/auth/register', (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, password, and full name are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Insert user
    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, shipping_address)
      VALUES (?, ?, ?, '')
    `);
    const result = insertUser.run(email, passwordHash, full_name);
    const userId = result.lastInsertRowid;

    // Generate JWT
    const token = jwt.sign({ id: userId, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true if running over HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      id: userId,
      email,
      full_name,
      shipping_address: '',
      role: 'user'
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login User
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      shipping_address: user.shipping_address,
      role: user.role
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Logout User
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Get Current User Profile (session check)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, full_name, shipping_address, role FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User session not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in auth check:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update User Profile Settings
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { full_name, shipping_address } = req.body;
  if (!full_name) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  try {
    const update = db.prepare('UPDATE users SET full_name = ?, shipping_address = ? WHERE id = ?');
    const result = update.run(full_name, shipping_address || '', req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Fetch updated user
    const user = db.prepare('SELECT id, email, full_name, shipping_address, role FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update User Password
app.put('/api/auth/password', authenticateToken, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current and new passwords are required.' });
  }

  try {
    // Find user to verify current password
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const validPassword = bcrypt.compareSync(current_password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid current password.' });
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(new_password, salt);

    const update = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    update.run(newHash, req.user.id);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating user password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Routes - Orders
// Create an order (checkout)
app.post('/api/orders', optionalAuthenticate, (req, res) => {
  const { shipping_name, shipping_address, items } = req.body;

  if (!shipping_name || !shipping_address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Shipping details and items are required.' });
  }

  // Create SQLite transaction to verify stock and insert items atomically
  const checkoutTx = db.transaction(() => {
    let subtotal = 0;
    const orderId = 'AURA-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // 1. Validate items stock and calculate subtotal
    const validatedItems = [];
    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} items left.`);
      }

      subtotal += product.price * item.quantity;
      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        price: product.price
      });
    }

    // 2. Calculate fees
    const shippingFee = subtotal >= 4999 ? 0 : 199;
    const total = subtotal + shippingFee;
    const userId = req.user ? req.user.id : null;

    // 3. Create order entry
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, user_id, shipping_name, shipping_address, subtotal, shipping_fee, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertOrder.run(orderId, userId, shipping_name, shipping_address, subtotal, shippingFee, total);

    // 4. Create items entries and update stock
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, size, quantity, price)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const updateStock = db.prepare(`
      UPDATE products
      SET stock = stock - ?
      WHERE id = ?
    `);

    for (const item of validatedItems) {
      insertOrderItem.run(orderId, item.productId, item.size, item.quantity, item.price);
      updateStock.run(item.quantity, item.productId);
    }

    return {
      orderId,
      subtotal,
      shippingFee,
      total,
      status: 'pending'
    };
  });

  try {
    const orderResult = checkoutTx();
    res.status(201).json(orderResult);
  } catch (error) {
    console.error('Error during checkout transaction:', error);
    res.status(400).json({ error: error.message || 'Transaction failed' });
  }
});

// Get user orders history
app.get('/api/orders/my-orders', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    
    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.id, oi.product_id, oi.size, oi.quantity, oi.price, p.name, p.art_svg_key
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);
      return { ...order, items };
    });
    
    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Process simulated payment for checkout order
app.post('/api/checkout/pay', (req, res) => {
  const { orderId, cardNum, cardName, cvv, expiry } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required.' });
  }

  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: `Order status is already ${order.status}.` });
    }

    // Simulate validation checks (e.g. CVV length, digits format)
    if (cvv && cvv.length < 3) {
      return res.status(400).json({ error: 'Payment verification failed: Invalid Security Code (CVV).' });
    }

    // Process payment success (transition to paid)
    const updateOrder = db.prepare(`
      UPDATE orders
      SET status = 'paid'
      WHERE id = ?
    `);
    updateOrder.run(orderId);

    res.json({
      success: true,
      message: 'Payment received successfully. Order initialized.',
      orderId,
      status: 'paid'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Retrieve dynamic tracking details for an order
app.get('/api/orders/track/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order coordinates not found.' });
    }
    
    // Dynamic status transition:
    // Placed (paid) -> Shipped (30s) -> En Route (90s) -> Delivered (180s)
    let simulatedStatus = order.status;
    if (order.status === 'paid') {
      const elapsedMs = Date.now() - new Date(order.created_at).getTime();
      const elapsedSec = elapsedMs / 1000;
      if (elapsedSec > 180) {
        simulatedStatus = 'delivered';
      } else if (elapsedSec > 90) {
        simulatedStatus = 'out_for_delivery';
      } else if (elapsedSec > 30) {
        simulatedStatus = 'shipped';
      }
    }

    const items = db.prepare(`
      SELECT oi.product_id, oi.size, oi.quantity, oi.price, p.name, p.art_svg_key
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(orderId);

    res.json({
      id: order.id,
      user_id: order.user_id,
      shipping_name: order.shipping_name,
      shipping_address: order.shipping_address,
      subtotal: order.subtotal,
      shipping_fee: order.shipping_fee,
      total: order.total,
      status: simulatedStatus,
      created_at: order.created_at,
      items
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin Stats Dashboard API
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    const totalSalesRow = db.prepare('SELECT SUM(total) as total FROM orders').get();
    const totalOrdersRow = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    
    const totalSales = totalSalesRow.total || 0;
    const totalOrders = totalOrdersRow.count || 0;
    
    const products = db.prepare('SELECT id, name, stock, price FROM products').all();
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    
    res.json({
      totalSales,
      totalOrders,
      products,
      orders
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update product stock (restock)
app.post('/api/admin/restock', requireAdmin, (req, res) => {
  const { productId, newStock } = req.body;
  if (!productId || newStock === undefined) {
    return res.status(400).json({ error: 'Product ID and new stock value are required.' });
  }
  try {
    const update = db.prepare('UPDATE products SET stock = ? WHERE id = ?');
    const result = update.run(newStock, productId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ success: true, productId, stock: newStock });
  } catch (error) {
    console.error('Error restocking product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update order status manually
app.post('/api/admin/update-status', requireAdmin, (req, res) => {
  const { orderId, status } = req.body;
  if (!orderId || !status) {
    return res.status(400).json({ error: 'Order ID and status are required.' });
  }
  try {
    const update = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
    const result = update.run(status, orderId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json({ success: true, orderId, status });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fallback wildcard route to serve client static assets
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Aura Farming API Server listening on port ${PORT}`);
});
