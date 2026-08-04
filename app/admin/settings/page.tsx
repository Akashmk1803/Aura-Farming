import React from 'react';

export default function AdminSettingsPage() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--disp)', fontSize: '2rem', textTransform: 'uppercase', marginBottom: '8px' }}>Store Settings</h1>
        <p style={{ color: 'var(--dim2)', fontSize: '0.9rem' }}>Manage store-wide configuration, pricing constants, and social links.</p>
      </div>
      
      <div style={{ background: 'var(--ink)', padding: '24px', borderRadius: '12px', border: '1px solid var(--hair2)' }}>
        <p style={{ color: 'var(--dim)', fontStyle: 'italic', fontSize: '0.85rem' }}>
          Settings module is under construction.
        </p>
      </div>
    </div>
  );
}
