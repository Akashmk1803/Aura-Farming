import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, orders } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await db.select().from(user).orderBy(desc(user.createdAt)).all();
    const allOrders = await db.select().from(orders).all();

    const result = customers.map(c => {
      const customerOrders = allOrders.filter(o => o.userId === c.id);
      const totalOrders = customerOrders.length;
      
      // Calculate lifetime spending based on completed/delivered orders, but simple sum of all non-cancelled/returned orders is fine
      const validOrders = customerOrders.filter(o => o.status !== 'cancelled' && o.status !== 'returned');
      const lifetimeSpending = validOrders.reduce((sum, o) => sum + o.total, 0);
      
      const lastOrder = customerOrders.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())[0];
      const lastOrderDate = lastOrder ? lastOrder.createdAt : null;

      return {
        ...c,
        totalOrders,
        lifetimeSpending,
        lastOrderDate,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching admin customers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
