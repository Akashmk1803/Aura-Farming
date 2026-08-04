'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PRODUCT_CATEGORIES = [
  { value: 'hoodies', label: 'Hoodie' },
  { value: 'tees', label: 'Tee' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'headwear', label: 'Headwear' },
  { value: 'limited', label: 'Limited' },
  { value: 'customize', label: 'Customize' },
];

const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label style={{ color: 'var(--dim)', fontSize: '0.9rem' }}>{label}</label>
    {children}
  </div>
);

export default function ProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'tees',
    categoryLabel: initialData?.categoryLabel || 'Tee',
    price: initialData?.price || '',
    mrp: initialData?.mrp || '',
    stock: initialData?.stock || 50,
    status: initialData?.status || 'in_stock',
    featured: initialData?.featured || false,
    isLimited: initialData?.isLimited || false,
    isCustomizable: initialData?.isCustomizable || false,
    imageUrl: initialData?.imageUrl || '',
    artSvgKey: initialData?.artSvgKey || 'tee',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const selected = PRODUCT_CATEGORIES.find(c => c.value === val);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        category: selected.value,
        categoryLabel: selected.label
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert('Cloudinary environment variables (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) are missing.');
      return;
    }

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const url = initialData ? `/api/admin/products/${initialData.id}` : '/api/admin/products';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = { 
    padding: '12px', background: 'var(--coal2)', border: '1px solid var(--hair)', 
    borderRadius: '8px', color: 'var(--bone)', fontFamily: 'var(--body)',
    width: '100%', boxSizing: 'border-box' 
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--coal)', border: '1px solid var(--hair)', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        .product-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .product-form-grid {
            grid-template-columns: 1fr 1fr;
            align-items: start;
          }
        }
        .upload-container {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          width: 100%;
        }
        .upload-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }
        .upload-controls button {
          width: 100%;
          box-sizing: border-box;
        }
        .input-group-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 500px) {
          .input-group-row {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
      {error && <div style={{ padding: '16px', background: 'rgba(225, 6, 0, 0.1)', color: 'var(--red)', borderRadius: '8px' }}>{error}</div>}
      
      <div className="product-form-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <InputGroup label="Product ID (Leave empty for auto-generate)">
            <input name="id" value={formData.id} onChange={handleChange} style={inputStyle} disabled={!!initialData} />
          </InputGroup>
          <InputGroup label="Product Name *">
            <input required name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
          </InputGroup>
          <InputGroup label="Description">
            <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, minHeight: '100px' }} />
          </InputGroup>
          
          <div className="input-group-row">
            <InputGroup label="Selling Price (₹) *">
              <input required type="number" name="price" value={formData.price} onChange={handleChange} style={inputStyle} />
            </InputGroup>
            <InputGroup label="MRP (₹)">
              <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} style={inputStyle} />
            </InputGroup>
          </div>

          <InputGroup label="Category *">
            <select
              required
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              style={inputStyle}
            >
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </InputGroup>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <InputGroup label="Product Image (Cloudinary)">
            <div className="upload-container">
              <div 
                style={{ flexShrink: 0, width: '120px', height: '120px', border: '2px dashed var(--hair)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--coal2)', overflow: 'hidden' }}
              >
                {formData.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'var(--dim)', fontSize: '0.8rem', textAlign: 'center' }}>No Image</span>
                )}
              </div>
              <div className="upload-controls">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: '12px 16px', background: 'var(--hair)', border: 'none', color: 'var(--bone)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </button>
                <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Or paste URL" style={inputStyle} />
              </div>
            </div>
          </InputGroup>

          <div className="input-group-row">
            <InputGroup label="Stock *">
              <input required type="number" name="stock" value={formData.stock} onChange={handleChange} style={inputStyle} />
            </InputGroup>
            <InputGroup label="Status *">
              <select name="status" value={formData.status} onChange={handleChange} style={inputStyle}>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out Of Stock</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="pre_order">Pre Order</option>
                <option value="limited_edition">Limited Edition</option>
              </select>
            </InputGroup>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'var(--bone)' }}>
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
              Featured Product
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'var(--bone)' }}>
              <input type="checkbox" name="isLimited" checked={formData.isLimited} onChange={handleChange} />
              Limited Edition Flag
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'var(--bone)' }}>
              <input type="checkbox" name="isCustomizable" checked={formData.isCustomizable} onChange={handleChange} />
              Customizable (Show initial input)
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px', borderTop: '1px solid var(--hair)', paddingTop: '24px' }}>
        <Link href="/admin/products" style={{ padding: '12px 24px', color: 'var(--bone)', textDecoration: 'none' }}>Cancel</Link>
        <button type="submit" disabled={isSaving || isUploading} style={{ padding: '12px 32px', background: 'var(--bone)', color: 'var(--ink)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--body)' }}>
          {isSaving ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
