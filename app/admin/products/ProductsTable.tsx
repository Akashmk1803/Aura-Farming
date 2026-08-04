'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProductsTable({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert('Failed to delete product');
      }
    } catch (e) {
      alert('An error occurred');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--disp)', fontSize: '2.5rem', textTransform: 'uppercase', color: 'var(--bone)' }}>Products</h1>
        <Link href="/admin/products/new" style={{ background: 'var(--bone)', color: 'var(--ink)', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontFamily: 'var(--body)' }}>
          + Add Product
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Search by name or ID..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '12px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)', flex: 1 }}
        />
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '12px', background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '8px', color: 'var(--bone)', minWidth: '200px' }}
        >
          <option value="all">All Categories</option>
          <option value="hoodies">Hoodies</option>
          <option value="tees">Tees</option>
          <option value="outerwear">Outerwear</option>
          <option value="bottoms">Bottoms</option>
          <option value="headwear">Headwear</option>
        </select>
      </div>

      <div style={{ background: 'var(--coal)', borderRadius: '12px', border: '1px solid var(--hair)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--coal2)', color: 'var(--dim)', borderBottom: '1px solid var(--hair)' }}>
              <th style={{ padding: '16px', fontWeight: 500 }}>Product</th>
              <th style={{ padding: '16px', fontWeight: 500 }}>Price (Selling / MRP)</th>
              <th style={{ padding: '16px', fontWeight: 500 }}>Stock</th>
              <th style={{ padding: '16px', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '16px', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--hair)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--bone)' }}>{p.name}</div>
                  <div style={{ color: 'var(--dim)', fontSize: '0.8rem', marginTop: '4px' }}>ID: {p.id} | {p.categoryLabel}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ color: 'var(--bone)', fontWeight: 600 }}>₹{p.price}</div>
                  {p.mrp > p.price && <div style={{ color: 'var(--dim)', textDecoration: 'line-through', fontSize: '0.8rem' }}>₹{p.mrp}</div>}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ color: p.stock < 10 ? 'var(--red)' : 'var(--bone)' }}>{p.stock}</span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600,
                    background: p.status === 'in_stock' ? 'rgba(74, 222, 128, 0.1)' : 'var(--hair)',
                    color: p.status === 'in_stock' ? '#4ade80' : 'var(--dim)'
                  }}>
                    {p.status.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href={`/admin/products/${p.id}`} style={{ padding: '6px 12px', background: 'var(--hair)', color: 'var(--bone)', borderRadius: '4px', textDecoration: 'none', fontSize: '0.8rem' }}>Edit</Link>
                    <button onClick={() => handleDelete(p.id)} style={{ padding: '6px 12px', background: 'var(--red)', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--dim)' }}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
