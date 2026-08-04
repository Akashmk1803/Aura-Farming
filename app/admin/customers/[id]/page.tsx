'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    fetch(`/api/admin/customers/${customerId}`)
      .then(res => res.json())
      .then(result => {
        if (result.customer) {
          setData(result);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customerId]);

  const handleUpdate = async (field: 'role' | 'status', value: string) => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (res.ok) {
        const result = await res.json();
        setData((prev: any) => ({ ...prev, customer: { ...prev.customer, ...result.user } }));
      } else {
        alert('Failed to update customer');
      }
    } catch (err) {
      alert('Error updating customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--bone)' }}>Loading customer details...</div>;
  if (!data) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--red)' }}>Customer not found.</div>;

  const { customer, orders, addresses, wishlist, couponUsages } = data;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'var(--body)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Link href="/admin/customers" style={{ color: 'var(--dim)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '8px', display: 'inline-block' }}>&larr; Back to Customers</Link>
          <h1 style={{ fontFamily: 'var(--disp)', fontSize: '2rem', textTransform: 'uppercase', color: 'var(--bone)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {customer.name}
            {customer.role === 'admin' && <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', fontFamily: 'var(--body)' }}>Admin</span>}
            {customer.status === 'blocked' && <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, background: 'rgba(225, 6, 0, 0.1)', color: 'var(--red)', fontFamily: 'var(--body)' }}>Blocked</span>}
          </h1>
        </div>
        
        {/* Account Actions */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={customer.role}
            onChange={(e) => handleUpdate('role', e.target.value)}
            disabled={saving}
            style={{ padding: '8px 12px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)', fontSize: '0.85rem' }}
          >
            <option value="user">User Role</option>
            <option value="admin">Admin Role</option>
          </select>

          {customer.status === 'active' ? (
            <button onClick={() => handleUpdate('status', 'blocked')} disabled={saving} style={{ padding: '8px 16px', background: 'rgba(225, 6, 0, 0.1)', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              Deactivate Account
            </button>
          ) : (
            <button onClick={() => handleUpdate('status', 'active')} disabled={saving} style={{ padding: '8px 16px', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', color: '#4ade80', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              Reactivate Account
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Profile Overview */}
          <div style={{ background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--coal2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {customer.image ? <img src={customer.image} alt={customer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'var(--dim)', fontSize: '2rem', textTransform: 'uppercase' }}>{customer.name.charAt(0)}</span>}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--bone)', fontSize: '1.2rem' }}>{customer.name}</div>
                <div style={{ color: 'var(--dim)', fontSize: '0.9rem' }}>Joined: {new Date(customer.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
              <div>
                <div style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>Email</div>
                <div style={{ color: 'var(--bone)' }}>{customer.email} {customer.emailVerified ? <span style={{ color: '#4ade80', fontSize: '0.75rem', marginLeft: '4px' }}>✓ Verified</span> : ''}</div>
              </div>
              <div>
                <div style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>Phone</div>
                <div style={{ color: 'var(--bone)' }}>{customer.phone || 'Not provided'}</div>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--hair)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>Lifetime Spend</div>
                <div style={{ color: 'var(--green)', fontWeight: 600, fontSize: '1.2rem' }}>₹{customer.lifetimeSpending.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>Total Orders</div>
                <div style={{ color: 'var(--bone)', fontWeight: 600, fontSize: '1.2rem' }}>{customer.totalOrders}</div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div style={{ background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '16px' }}>Saved Addresses ({addresses.length})</h2>
            {addresses.length === 0 ? (
              <div style={{ color: 'var(--dim)', fontSize: '0.9rem' }}>No addresses saved.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {addresses.map((a: any) => (
                  <div key={a.id} style={{ background: 'var(--coal2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--hair)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--bone)' }}>{a.name} <span style={{ color: 'var(--dim)', fontSize: '0.8rem', fontWeight: 400 }}>({a.addressType})</span></div>
                      {a.isDefault && <span style={{ background: 'rgba(236,232,225,0.1)', color: 'var(--bone)', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>Default</span>}
                    </div>
                    <div style={{ color: 'var(--dim)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                      {a.flatNumber}, {a.locality}, {a.landmark}<br />
                      {a.city}, {a.district}, {a.state} {a.pinCode}
                    </div>
                    <div style={{ color: 'var(--dim)', fontSize: '0.85rem', marginTop: '8px' }}>Phone: {a.mobile}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Orders History */}
          <div style={{ background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '16px' }}>Order History ({orders.length})</h2>
            {orders.length === 0 ? (
              <div style={{ color: 'var(--dim)', fontSize: '0.9rem' }}>No orders placed.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                {orders.map((o: any) => (
                  <Link href={`/admin/orders/${o.id}`} key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--coal2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--hair)', textDecoration: 'none' }}>
                    <div>
                      <div style={{ color: 'var(--bone)', fontWeight: 600, fontFamily: 'var(--mono)', fontSize: '0.9rem' }}>{o.id.split('_')[1] || o.id}</div>
                      <div style={{ color: 'var(--dim)', fontSize: '0.8rem', marginTop: '4px' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--bone)', fontWeight: 600 }}>₹{o.total.toLocaleString('en-IN')}</div>
                      <span style={{ 
                        display: 'inline-block', marginTop: '4px', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600,
                        background: o.status === 'delivered' ? 'rgba(74, 222, 128, 0.1)' : o.status === 'cancelled' || o.status === 'returned' ? 'rgba(225, 6, 0, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                        color: o.status === 'delivered' ? '#4ade80' : o.status === 'cancelled' || o.status === 'returned' ? 'var(--red)' : '#facc15'
                      }}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist */}
          <div style={{ background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '16px' }}>Wishlist ({wishlist.length})</h2>
            {wishlist.length === 0 ? (
              <div style={{ color: 'var(--dim)', fontSize: '0.9rem' }}>Wishlist is empty.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                {wishlist.map((w: any) => (
                  <div key={w.id} style={{ background: 'var(--coal2)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--hair)' }}>
                    <div style={{ width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                      {w.imageUrl ? <img src={w.imageUrl} alt={w.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} /> : <span style={{ fontSize: '0.7rem', color: 'var(--dim)' }}>{w.artSvgKey}</span>}
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div style={{ color: 'var(--bone)', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</div>
                      <div style={{ color: 'var(--dim)', fontSize: '0.8rem', marginTop: '4px' }}>Size: {w.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coupons Used */}
          {couponUsages.length > 0 && (
            <div style={{ background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '16px' }}>Coupons Used</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {couponUsages.map((cu: any) => (
                  <div key={cu.id} style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                    {cu.couponCode}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
