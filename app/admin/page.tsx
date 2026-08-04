import { db } from '@/db';
import { orders, products, user } from '@/db/schema';
import { sql, eq, desc, inArray, and, gte } from 'drizzle-orm';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  // Fetch Aggregate Stats
  const revenueResult = await db.select({ total: sql`SUM(${orders.total})` }).from(orders).where(sql`${orders.status} NOT IN ('cancelled', 'returned')`);
  const totalRevenue = Number(revenueResult[0]?.total || 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();
  
  const todayRevenueResult = await db.select({ total: sql`SUM(${orders.total})` }).from(orders)
    .where(and(
      sql`${orders.status} NOT IN ('cancelled', 'returned')`,
      gte(orders.createdAt, todayStr)
    ));
  const todayRevenue = Number(todayRevenueResult[0]?.total || 0);

  const ordersCountResult = await db.select({
    total: sql`COUNT(*)`,
    pending: sql`SUM(CASE WHEN ${orders.status} IN ('pending', 'pending_cod') THEN 1 ELSE 0 END)`,
    delivered: sql`SUM(CASE WHEN ${orders.status} = 'delivered' THEN 1 ELSE 0 END)`,
    cancelled: sql`SUM(CASE WHEN ${orders.status} IN ('cancelled', 'returned') THEN 1 ELSE 0 END)`
  }).from(orders);

  const ordersCount = ordersCountResult[0];

  const customersCount = await db.select({ count: sql`COUNT(*)` }).from(user).where(eq(user.role, 'user'));
  const totalCustomers = Number(customersCount[0]?.count || 0);

  const productsCountResult = await db.select({
    total: sql`COUNT(*)`,
    lowStock: sql`SUM(CASE WHEN ${products.stock} < 10 THEN 1 ELSE 0 END)`
  }).from(products);
  const productsCount = productsCountResult[0];

  const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6);

  const StatCard = ({ title, value, prefix = '' }: { title: string, value: string | number, prefix?: string }) => (
    <div style={{ background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ color: 'var(--dim)', fontSize: '0.9rem', fontWeight: 500 }}>{title}</div>
      <div style={{ color: 'var(--bone)', fontFamily: 'var(--disp)', fontSize: '2rem', letterSpacing: '0.02em' }}>
        {prefix}{value.toLocaleString('en-IN')}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--disp)', fontSize: '2.5rem', textTransform: 'uppercase', color: 'var(--bone)' }}>Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <StatCard title="Total Revenue" value={totalRevenue} prefix="₹" />
        <StatCard title="Today's Revenue" value={todayRevenue} prefix="₹" />
        <StatCard title="Total Orders" value={Number(ordersCount.total || 0)} />
        <StatCard title="Total Customers" value={totalCustomers} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <StatCard title="Pending Orders" value={Number(ordersCount.pending || 0)} />
        <StatCard title="Delivered Orders" value={Number(ordersCount.delivered || 0)} />
        <StatCard title="Cancelled/Returned" value={Number(ordersCount.cancelled || 0)} />
        <StatCard title="Total Products" value={Number(productsCount.total || 0)} />
        <StatCard title="Low Stock Products" value={Number(productsCount.lowStock || 0)} />
      </div>

      <div style={{ background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.5rem', color: 'var(--bone)' }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ color: 'var(--dim)', fontSize: '0.85rem', textDecoration: 'underline' }}>View All</Link>
        </div>
        
        {recentOrders.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ color: 'var(--dim)', borderBottom: '1px solid var(--hair)' }}>
                <th style={{ padding: '12px 0', fontWeight: 500 }}>Order ID</th>
                <th style={{ padding: '12px 0', fontWeight: 500 }}>Customer</th>
                <th style={{ padding: '12px 0', fontWeight: 500 }}>Amount</th>
                <th style={{ padding: '12px 0', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '12px 0', fontWeight: 500 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--hair2)' }}>
                  <td style={{ padding: '16px 0', fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{o.id.split('_')[1] || o.id}</td>
                  <td style={{ padding: '16px 0' }}>{o.shippingName}</td>
                  <td style={{ padding: '16px 0', fontWeight: 600 }}>₹{o.total.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '16px 0' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600,
                      background: o.status === 'delivered' ? 'rgba(74, 222, 128, 0.1)' : o.status === 'pending' || o.status.includes('pending') ? 'rgba(250, 204, 21, 0.1)' : 'var(--hair)',
                      color: o.status === 'delivered' ? '#4ade80' : o.status === 'pending' || o.status.includes('pending') ? '#facc15' : 'var(--dim)'
                    }}>
                      {o.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '16px 0', color: 'var(--dim)' }}>
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: 'var(--dim)', padding: '20px 0', textAlign: 'center' }}>No recent orders.</div>
        )}
      </div>
    </div>
  );
}
