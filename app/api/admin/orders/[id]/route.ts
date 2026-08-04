import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';

const getOrderStatusEmailHTML = (status: string, orderId: string, name: string) => {
  const displayId = orderId.split('_')[1] || orderId;
  const statusLabels: Record<string, string> = {
    'confirmed': 'Order Confirmed',
    'shipped': 'Order Shipped',
    'out_for_delivery': 'Out For Delivery',
    'delivered': 'Order Delivered',
    'cancelled': 'Order Cancelled',
    'returned': 'Order Returned'
  };

  const statusMessages: Record<string, string> = {
    'confirmed': 'Your order has been confirmed and is being prepared.',
    'shipped': 'Your order has been shipped and is on its way.',
    'out_for_delivery': 'Your order is out for delivery today!',
    'delivered': 'Your order has been successfully delivered. Wear the Mark.',
    'cancelled': 'Your order has been cancelled. Any payments made will be refunded shortly.',
    'returned': 'Your return has been processed.'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', sans-serif; background-color: #0c0c0e; color: #ece8e1; padding: 40px; }
        .container { max-width: 500px; margin: 0 auto; background-color: #161619; padding: 30px; border: 1px solid #333; border-radius: 8px; }
        h1 { color: #e10600; font-size: 20px; text-transform: uppercase; }
        p { color: #ece8e1; font-size: 14px; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${statusLabels[status] || 'Order Update'}</h1>
        <p>Hi ${name},</p>
        <p>${statusMessages[status] || `Your order #${displayId} status has been updated to ${status}.`}</p>
        <p>You can track your order status on our website.</p>
        <p style="margin-top: 30px; font-size: 11px; color: #666; text-transform: uppercase;">Aura Farming</p>
      </div>
    </body>
    </html>
  `;
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const order = await db.select({
      id: orders.id,
      userId: orders.userId,
      shippingName: orders.shippingName,
      shippingAddress: orders.shippingAddress,
      subtotal: orders.subtotal,
      convenienceFee: orders.convenienceFee,
      platformFee: orders.platformFee,
      deliveryFee: orders.deliveryFee,
      codFee: orders.codFee,
      shippingFee: orders.shippingFee,
      total: orders.total,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      refundAmount: orders.refundAmount,
      phone: orders.phone,
      createdAt: orders.createdAt,
      paymentGatewayOrderId: orders.paymentGatewayOrderId,
      couponCode: orders.couponCode,
      discountAmount: orders.discountAmount,
      email: user.email
    })
    .from(orders)
    .leftJoin(user, eq(orders.userId, user.id))
    .where(eq(orders.id, id))
    .get();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const items = await db.select({
      id: orderItems.id,
      productId: orderItems.productId,
      size: orderItems.size,
      quantity: orderItems.quantity,
      price: orderItems.price,
      name: products.name,
      mrp: products.mrp,
      imageUrl: products.imageUrl,
      artSvgKey: products.artSvgKey
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, id))
    .all();

    return NextResponse.json({ order, items });
  } catch (error) {
    console.error('Error fetching admin order details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const order = await db.select().from(orders).where(eq(orders.id, id)).get();
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const prevStatus = order.status;
    await db.update(orders).set({ status }).where(eq(orders.id, id));

    // Stock management
    if ((status === 'cancelled' || status === 'returned') && prevStatus !== 'cancelled' && prevStatus !== 'returned') {
      // Restore stock
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id)).all();
      for (const item of items) {
        const product = await db.select().from(products).where(eq(products.id, item.productId)).get();
        if (product) {
          await db.update(products).set({ stock: product.stock + item.quantity }).where(eq(products.id, product.id));
        }
      }
    } else if (status !== 'cancelled' && status !== 'returned' && (prevStatus === 'cancelled' || prevStatus === 'returned')) {
      // If admin changes from cancelled back to active, deduct stock
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id)).all();
      for (const item of items) {
        const product = await db.select().from(products).where(eq(products.id, item.productId)).get();
        if (product) {
          await db.update(products).set({ stock: Math.max(0, product.stock - item.quantity) }).where(eq(products.id, product.id));
        }
      }
    }

    // Email Notification
    if (['confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'].includes(status) && status !== prevStatus) {
      if (order.userId) {
        const orderUser = await db.select().from(user).where(eq(user.id, order.userId)).get();
        if (orderUser && orderUser.email) {
          try {
            await sendEmail({
              to: orderUser.email,
              subject: `Aura Farming: Order ${status.toUpperCase().replace('_', ' ')}`,
              text: `Your order ${id} is now ${status}.`,
              html: getOrderStatusEmailHTML(status, id, order.shippingName)
            });
          } catch (e) {
            console.error('Failed to send status email:', e);
            // Don't fail the request if email fails
          }
        }
      }
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
