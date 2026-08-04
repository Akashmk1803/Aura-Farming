'use client';

import { useState, useEffect } from 'react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', maxDiscount: '',
    isActive: true, isOneTime: false, isWelcome: false, usageLimit: '', expiryDate: '', description: ''
  });

  const fetchCoupons = () => {
    setLoading(true);
    fetch('/api/admin/coupons')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCoupons(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing ? `/api/admin/coupons/${formData.code}` : '/api/admin/coupons';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchCoupons();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to save coupon');
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    const res = await fetch(`/api/admin/coupons/${code}`, { method: 'DELETE' });
    if (res.ok) fetchCoupons();
    else alert('Failed to delete coupon');
  };

  const handleDuplicate = (coupon: any) => {
    setFormData({ ...coupon, code: coupon.code + '_COPY' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (code: string, currentStatus: boolean) => {
    const res = await fetch(`/api/admin/coupons/${code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentStatus })
    });
    if (res.ok) fetchCoupons();
  };

  const filteredCoupons = coupons.filter(c => {
    const term = search.toLowerCase();
    const matchSearch = c.code.toLowerCase().includes(term);

    let matchFilter = true;
    if (filter === 'active') matchFilter = c.isActive;
    else if (filter === 'inactive') matchFilter = !c.isActive;
    else if (filter === 'expired') matchFilter = c.expiryDate && new Date(c.expiryDate) < new Date();
    else if (filter === 'onetime') matchFilter = c.isOneTime;
    else if (filter === 'percentage') matchFilter = c.discountType === 'percentage';
    else if (filter === 'fixed') matchFilter = c.discountType === 'fixed';

    return matchSearch && matchFilter;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--body)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--disp)', fontSize: '2.5rem', textTransform: 'uppercase', color: 'var(--bone)' }}>Coupons</h1>
        <button 
          onClick={() => {
            setFormData({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', maxDiscount: '', isActive: true, isOneTime: false, isWelcome: false, usageLimit: '', expiryDate: '', description: '' });
            setIsEditing(false);
            setIsModalOpen(true);
          }}
          style={{ padding: '12px 24px', background: 'var(--bone)', color: 'var(--coal)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Create Coupon
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Search Code..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '12px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)', flex: '1 1 300px' }}
        />
        
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '12px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)' }}>
          <option value="all">All Coupons</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
          <option value="onetime">One-Time</option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </div>

      <div style={{ background: 'var(--coal)', borderRadius: '12px', border: '1px solid var(--hair)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--dim)' }}>Loading coupons...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--coal2)', color: 'var(--dim)', borderBottom: '1px solid var(--hair)' }}>
                <th style={{ padding: '16px', fontWeight: 500 }}>Coupon Code</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Discount</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Status / Limits</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Usage</th>
                <th style={{ padding: '16px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map(c => {
                const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date();
                return (
                  <tr key={c.code} style={{ borderBottom: '1px solid var(--hair)', opacity: c.isActive ? 1 : 0.6 }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--bone)', fontSize: '1.1rem', letterSpacing: '1px' }}>{c.code}</div>
                      {c.description && <div style={{ color: 'var(--dim)', fontSize: '0.8rem', marginTop: '4px' }}>{c.description}</div>}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--bone)' }}>
                      <div style={{ fontWeight: 600 }}>{c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}</div>
                      <div style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>Min: ₹{c.minOrderValue}</div>
                      {c.maxDiscount && <div style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>Max: ₹{c.maxDiscount}</div>}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, background: c.isActive ? 'rgba(74,222,128,0.1)' : 'rgba(225,6,0,0.1)', color: c.isActive ? '#4ade80' : 'var(--red)' }}>
                          {c.isActive ? 'Active' : 'Disabled'}
                        </span>
                        {isExpired && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, background: 'rgba(250,204,21,0.1)', color: '#facc15' }}>Expired</span>}
                        {c.isWelcome && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>Welcome</span>}
                        {c.isOneTime && <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>1-Time</span>}
                      </div>
                      {c.expiryDate && <div style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>Exp: {new Date(c.expiryDate).toLocaleDateString('en-IN')}</div>}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--bone)' }}>
                      <div style={{ fontWeight: 600 }}>{c.usageCount} {c.usageLimit ? `/ ${c.usageLimit}` : 'Uses'}</div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => handleToggleActive(c.code, c.isActive)} style={{ padding: '6px 12px', background: 'var(--coal2)', border: '1px solid var(--hair)', color: 'var(--bone)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>{c.isActive ? 'Disable' : 'Enable'}</button>
                        <button onClick={() => { setFormData({...c, expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : ''}); setIsEditing(true); setIsModalOpen(true); }} style={{ padding: '6px 12px', background: 'var(--coal2)', border: '1px solid var(--hair)', color: 'var(--bone)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                        <button onClick={() => handleDuplicate(c)} style={{ padding: '6px 12px', background: 'var(--coal2)', border: '1px solid var(--hair)', color: 'var(--bone)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Copy</button>
                        <button onClick={() => handleDelete(c.code)} style={{ padding: '6px 12px', background: 'rgba(225,6,0,0.1)', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCoupons.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--dim)' }}>No coupons found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--hair)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.5rem', color: 'var(--bone)' }}>{isEditing ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--dim)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <input required type="text" disabled={isEditing} value={formData.code ?? ""} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '10px', background: 'var(--coal2)', border: '1px solid var(--hair)', borderRadius: '6px', color: 'var(--bone)', fontWeight: 600, letterSpacing: '1px' }} />
                </div>
                <div>
                  <input type="text" value={formData.description ?? ""} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--coal2)', border: '1px solid var(--hair)', borderRadius: '6px', color: 'var(--bone)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <select value={formData.discountType ?? "percentage"} onChange={e => setFormData({...formData, discountType: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--coal2)', border: '1px solid var(--hair)', borderRadius: '6px', color: 'var(--bone)' }}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <input required type="number" value={formData.discountValue ?? ""} onChange={e => setFormData({...formData, discountValue: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--coal2)', border: '1px solid var(--hair)', borderRadius: '6px', color: 'var(--bone)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <input required type="number" value={formData.minOrderValue ?? ""} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--coal2)', border: '1px solid var(--hair)', borderRadius: '6px', color: 'var(--bone)' }} />
                </div>
                <div>
                  <input type="number" disabled={formData.discountType === 'fixed'} value={formData.maxDiscount ?? ""} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--coal2)', border: '1px solid var(--hair)', borderRadius: '6px', color: 'var(--bone)', opacity: formData.discountType === 'fixed' ? 0.5 : 1 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <input type="date" value={formData.expiryDate ?? ""} onChange={e => setFormData({...formData, expiryDate: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--coal2)', border: '1px solid var(--hair)', borderRadius: '6px', color: 'var(--bone)' }} />
                </div>
                <div>
                  <input type="number" value={formData.usageLimit ?? ""} onChange={e => setFormData({...formData, usageLimit: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--coal2)', border: '1px solid var(--hair)', borderRadius: '6px', color: 'var(--bone)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--coal2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--hair)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'var(--bone)' }}>
                  <input type="checkbox" checked={Boolean(formData.isActive)} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  Active (Can be used)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'var(--bone)' }}>
                  <input type="checkbox" checked={Boolean(formData.isOneTime)} onChange={e => setFormData({...formData, isOneTime: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  One-Time Use (Per Customer)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#a855f7' }}>
                  <input type="checkbox" checked={Boolean(formData.isWelcome)} onChange={e => setFormData({...formData, isWelcome: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#a855f7' }} />
                  <strong>Welcome Coupon</strong> (Shows in popup to new users)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--hair)', color: 'var(--bone)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', background: 'var(--bone)', border: 'none', color: 'var(--coal)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Coupon</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
