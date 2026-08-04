'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(o => {
    const term = search.toLowerCase();
    const matchSearch = 
      o.id.toLowerCase().includes(term) ||
      o.shippingName?.toLowerCase().includes(term) ||
      o.email?.toLowerCase().includes(term) ||
      o.phone?.toLowerCase().includes(term);

    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    
    // Prepaid includes card and upi
    let matchPayment = true;
    if (paymentFilter === 'prepaid') matchPayment = o.paymentMethod !== 'cod';
    if (paymentFilter === 'cod') matchPayment = o.paymentMethod === 'cod';

    let matchDate = true;
    if (dateRange !== 'all') {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      if (dateRange === 'today') {
        matchDate = orderDate.toDateString() === now.toDateString();
      } else if (dateRange === '7days') {
        matchDate = (now.getTime() - orderDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      } else if (dateRange === '30days') {
        matchDate = (now.getTime() - orderDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      }
    }

    return matchSearch && matchStatus && matchPayment && matchDate;
  }).sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--disp)', fontSize: '2.5rem', textTransform: 'uppercase', color: 'var(--bone)', marginBottom: '24px' }}>Orders</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Search ID, Name, Email, Phone..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '12px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)', flex: '1 1 250px' }}
        />
        
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '12px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)' }}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out For Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </select>

        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} style={{ padding: '12px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)' }}>
          <option value="all">All Payments</option>
          <option value="prepaid">Prepaid</option>
          <option value="cod">COD</option>
        </select>

        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ padding: '12px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)' }}>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ padding: '12px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)' }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div style={{ background: 'var(--coal)', borderRadius: '12px', border: '1px solid var(--hair)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--dim)' }}>Loading orders...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--coal2)', color: 'var(--dim)', borderBottom: '1px solid var(--hair)' }}>
                <th style={{ padding: '16px', fontWeight: 500 }}>Order ID</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Customer</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Payment</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Coupon</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Total</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--hair)' }}>
                  <td style={{ padding: '16px', fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>
                    <Link href={`/admin/orders/${o.id}`} style={{ color: 'var(--bone)', textDecoration: 'underline' }}>{o.id.split('_')[1] || o.id}</Link>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--bone)' }}>{o.shippingName}</div>
                    <div style={{ color: 'var(--dim)', fontSize: '0.8rem', marginTop: '4px' }}>{o.email}</div>
                    <div style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>{o.phone}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ textTransform: 'uppercase', color: 'var(--dim)', fontSize: '0.8rem', fontWeight: 600 }}>{o.paymentMethod}</span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--green)', fontWeight: 600, fontSize: '0.8rem' }}>
                    {o.couponCode || '-'}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--bone)' }}>
                    ₹{o.total.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600,
                      background: o.status === 'delivered' ? 'rgba(74, 222, 128, 0.1)' : o.status === 'cancelled' || o.status === 'returned' ? 'rgba(225, 6, 0, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                      color: o.status === 'delivered' ? '#4ade80' : o.status === 'cancelled' || o.status === 'returned' ? 'var(--red)' : '#facc15'
                    }}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--dim)', fontSize: '0.85rem' }}>
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--dim)' }}>No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
