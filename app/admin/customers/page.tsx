'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/admin/customers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter(c => {
    const term = search.toLowerCase();
    const matchSearch = 
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term);

    let matchFilter = true;
    if (filter === 'new') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchFilter = new Date(c.createdAt) >= thirtyDaysAgo;
    } else if (filter === 'returning') {
      matchFilter = c.totalOrders > 1;
    } else if (filter === 'admins') {
      matchFilter = c.role === 'admin';
    } else if (filter === 'blocked') {
      matchFilter = c.status === 'blocked';
    }

    return matchSearch && matchFilter;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--disp)', fontSize: '2.5rem', textTransform: 'uppercase', color: 'var(--bone)', marginBottom: '24px' }}>Customers</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Search Name, Email, Phone..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '12px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)', flex: '1 1 300px' }}
        />
        
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '12px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)' }}>
          <option value="all">All Customers</option>
          <option value="new">New Customers (Last 30 Days)</option>
          <option value="returning">Returning (&gt;1 Order)</option>
          <option value="admins">Admins</option>
          <option value="blocked">Blocked / Deactivated</option>
        </select>
      </div>

      <div style={{ background: 'var(--coal)', borderRadius: '12px', border: '1px solid var(--hair)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--dim)' }}>Loading customers...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--coal2)', color: 'var(--dim)', borderBottom: '1px solid var(--hair)' }}>
                <th style={{ padding: '16px', fontWeight: 500 }}>Customer</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Status / Role</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Orders</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Lifetime Spend</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--hair)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--coal2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {c.image ? <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'var(--dim)', fontSize: '1.2rem', textTransform: 'uppercase' }}>{c.name.charAt(0)}</span>}
                      </div>
                      <div>
                        <Link href={`/admin/customers/${c.id}`} style={{ fontWeight: 600, color: 'var(--bone)', textDecoration: 'underline' }}>{c.name}</Link>
                        <div style={{ color: 'var(--dim)', fontSize: '0.8rem', marginTop: '2px' }}>{c.email}</div>
                        {c.phone && <div style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>{c.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600,
                        background: c.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(225, 6, 0, 0.1)',
                        color: c.status === 'active' ? '#4ade80' : 'var(--red)'
                      }}>
                        {c.status}
                      </span>
                      {c.role === 'admin' && (
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600,
                          background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7'
                        }}>
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--bone)' }}>
                    <div style={{ fontWeight: 600 }}>{c.totalOrders}</div>
                    {c.lastOrderDate && <div style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>Last: {new Date(c.lastOrderDate).toLocaleDateString('en-IN')}</div>}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--green)' }}>
                    ₹{c.lifetimeSpending.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--dim)', fontSize: '0.85rem' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--dim)' }}>No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
