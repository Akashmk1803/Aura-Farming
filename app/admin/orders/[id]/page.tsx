'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/admin/orders/${orderId}`)
      .then(res => res.json())
      .then(result => {
        if (result.order) {
          setData(result);
          setStatus(result.order.status);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) alert('Failed to update status');
    } catch (err) {
      alert('Error updating status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--bone)' }}>Loading order details...</div>;
  if (!data) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--red)' }}>Order not found.</div>;

  const { order, items } = data;
  const displayId = order.id.split('_')[1] || order.id;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'var(--body)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Link href="/admin/orders" style={{ color: 'var(--dim)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '8px', display: 'inline-block' }}>&larr; Back to Orders</Link>
          <h1 style={{ fontFamily: 'var(--disp)', fontSize: '2rem', textTransform: 'uppercase', color: 'var(--bone)' }}>Order #{displayId}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ color: 'var(--dim)', fontSize: '0.9rem' }}>Update Status:</label>
          <select 
            value={status}
            onChange={handleStatusChange}
            disabled={saving}
            style={{ padding: '10px 16px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)', fontWeight: 600, textTransform: 'uppercase' }}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out For Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
          {saving && <span style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>Saving...</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Items */}
          <div style={{ background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '16px' }}>Ordered Products</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--hair)', paddingBottom: '16px' }}>
                  <div style={{ width: '80px', height: '80px', background: 'var(--coal2)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ color: 'var(--dim)', fontSize: '0.7rem' }}>{item.artSvgKey}</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--bone)', fontSize: '1.1rem' }}>{item.name}</div>
                    <div style={{ color: 'var(--dim)', fontSize: '0.9rem', margin: '4px 0' }}>Size: {item.size}</div>
                    <div style={{ color: 'var(--dim2)', fontSize: '0.85rem' }}>Qty: {item.quantity} &times; ₹{item.price.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--bone)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                    {item.mrp > item.price && <div style={{ color: 'var(--dim)', textDecoration: 'line-through', fontSize: '0.8rem' }}>₹{(item.mrp * item.quantity).toLocaleString('en-IN')}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline / Status */}
          <div style={{ background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '16px' }}>Order Info</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--dim)' }}>Date Placed</span>
                <span style={{ color: 'var(--bone)' }}>{new Date(order.createdAt).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--dim)' }}>Payment Method</span>
                <span style={{ color: 'var(--bone)', textTransform: 'uppercase', fontWeight: 600 }}>{order.paymentMethod}</span>
              </div>
              {order.paymentGatewayOrderId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--dim)' }}>Gateway ID</span>
                  <span style={{ color: 'var(--bone)', fontFamily: 'var(--mono)' }}>{order.paymentGatewayOrderId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Customer Info */}
          <div style={{ background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '16px' }}>Customer Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
              <div>
                <div style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>Name</div>
                <div style={{ color: 'var(--bone)', fontWeight: 600 }}>{order.shippingName}</div>
              </div>
              <div>
                <div style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>Email</div>
                <div style={{ color: 'var(--bone)' }}>{order.email || 'Guest'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>Phone</div>
                <div style={{ color: 'var(--bone)' }}>{order.phone}</div>
              </div>
              <div>
                <div style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>Shipping Address</div>
                <div style={{ color: 'var(--bone)', whiteSpace: 'pre-line', lineHeight: '1.4' }}>{order.shippingAddress}</div>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div style={{ background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.2rem', color: 'var(--bone)', marginBottom: '16px' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--dim)' }}>Subtotal</span>
                <span style={{ color: 'var(--bone)' }}>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--green)' }}>Discount ({order.couponCode})</span>
                  <span style={{ color: 'var(--green)' }}>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {order.convenienceFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--dim)' }}>Convenience Fee</span>
                  <span style={{ color: 'var(--bone)' }}>₹{order.convenienceFee.toLocaleString('en-IN')}</span>
                </div>
              )}
              {order.platformFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--dim)' }}>Platform Fee</span>
                  <span style={{ color: 'var(--bone)' }}>₹{order.platformFee.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--dim)' }}>Delivery Fee</span>
                <span style={{ color: 'var(--bone)' }}>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toLocaleString('en-IN')}`}</span>
              </div>
              {order.codFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--dim)' }}>COD Fee</span>
                  <span style={{ color: 'var(--bone)' }}>₹{order.codFee.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--hair)', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem' }}>
                <span style={{ color: 'var(--bone)' }}>Total</span>
                <span style={{ color: 'var(--bone)' }}>₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
