"use client";

import React, { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';

interface Product {
  id: string;
  name: string;
  desc: string;
  price: number;
  cat: string;
  catLabel: string;
  art: 'hoodie' | 'tee' | 'longsleeve';
  stock: number;
  isLimited: boolean;
  isCustomizable: boolean;
}

const SVGS = {
  hoodie: (color: string, textVal: string) => `
    <svg viewBox="0 0 200 220" width="100%" height="100%">
      <path d="M62 52 Q58 30 78 22 Q100 12 122 22 Q142 30 138 52 L162 62 Q176 68 178 84 L186 150 Q187 160 177 162 L156 166 Q149 167 148 158 L144 120 L144 196 Q144 206 134 206 L66 206 Q56 206 56 196 L56 120 L52 158 Q51 167 44 166 L23 162 Q13 160 14 150 L22 84 Q24 68 38 62 Z" fill="${color}" stroke="#2c2c31" stroke-width="2"/>
      <path d="M74 40 Q100 62 126 40 Q120 66 100 66 Q80 66 74 40Z" fill="#0d0d0f" stroke="#2c2c31" stroke-width="2"/>
      <path d="M92 66 V96 M108 66 V96" stroke="#3a1214" stroke-width="4" stroke-linecap="round"/>
      <rect x="70" y="176" width="60" height="14" rx="4" fill="#0f0f11" stroke="#2c2c31"/>
      ${textVal ? `<text x="100" y="130" text-anchor="middle" fill="#ece8e1" font-size="10" font-family="'Anton', sans-serif" letter-spacing="1.5" font-weight="bold">${textVal.toUpperCase()}</text>` : `<svg x="72" y="92" width="56" height="76" viewBox="0 0 100 140" style="color:#e10600"><g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="square"><path d="M50 14 V126"/><path d="M50 70 L80 100"/><path d="M50 70 L20 100"/></g></svg>`}
    </svg>
  `,
  tee: (color: string, textVal: string) => `
    <svg viewBox="0 0 200 220" width="100%" height="100%">
      <path d="M70 34 Q84 26 100 26 Q116 26 130 34 L168 52 Q176 56 173 65 L162 90 Q159 97 151 94 L138 88 L140 192 Q140 202 130 202 L70 202 Q60 202 60 192 L62 88 L49 94 Q41 97 38 90 L27 65 Q24 56 32 52 Z" fill="${color}" stroke="#2c2c31" stroke-width="2"/>
      <path d="M84 32 Q100 44 116 32" fill="none" stroke="#2c2c31" stroke-width="2"/>
      ${textVal ? `<text x="100" y="125" text-anchor="middle" fill="#ece8e1" font-size="10" font-family="'Anton', sans-serif" letter-spacing="1.5" font-weight="bold">${textVal.toUpperCase()}</text>` : `<svg x="70" y="74" width="60" height="82" viewBox="0 0 100 140" style="color:#e10600"><g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="square"><path d="M50 14 V126"/><path d="M50 70 L80 100"/><path d="M50 70 L20 100"/></g></svg>`}
      <text x="100" y="184" text-anchor="middle" fill="#7c7872" font-size="10" font-family="Anton" letter-spacing="4">AURA FARMING</text>
    </svg>
  `,
  longsleeve: (color: string, textVal: string) => `
    <svg viewBox="0 0 200 220" width="100%" height="100%">
      <path d="M72 34 Q86 26 100 26 Q114 26 128 34 L158 48 Q168 53 169 64 L176 168 Q177 178 167 179 L150 181 Q142 182 141 173 L138 96 L138 194 Q138 202 130 202 L70 202 Q62 202 62 194 L62 96 L59 173 Q58 182 50 181 L33 179 Q23 178 24 168 L31 64 Q32 53 42 48 Z" fill="${color}" stroke="#2c2c31" stroke-width="2"/>
      <path d="M86 32 Q100 42 114 32" fill="none" stroke="#2c2c31" stroke-width="2"/>
      <path d="M24 168 L59 166 M141 166 L176 168" stroke="#e10600" stroke-width="2.5"/>
      <circle cx="100" cy="112" r="34" fill="none" stroke="#e10600" stroke-width="2.5"/>
      ${textVal ? `<text x="100" y="115" text-anchor="middle" fill="#ece8e1" font-size="9" font-family="'Anton', sans-serif" letter-spacing="1.2" font-weight="bold">${textVal.toUpperCase()}</text>` : `<svg x="78" y="84" width="44" height="58" viewBox="0 0 100 140" style="color:#e10600"><g fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="square"><path d="M50 14 V126"/><path d="M50 70 L80 100"/><path d="M50 70 L20 100"/></g></svg>`}
    </svg>
  `
};

const COLORS = [
  { name: 'Black', hex: '#111113' },
  { name: 'Red', hex: '#7a0502' },
  { name: 'Charcoal', hex: '#2b2b2e' }
];

export default function CustomizeBuilder() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [customText, setCustomText] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastShow, setToastShow] = useState(false);

  const fly = (msg: string) => {
    setToastMessage(msg);
    setToastShow(true);
  };

  useEffect(() => {
    if (toastShow) {
      const t = setTimeout(() => setToastShow(false), 2200);
      return () => clearTimeout(t);
    }
  }, [toastShow]);

  // Load customisable items
  useEffect(() => {
    authClient.getSession().then(res => {
      if (res.data) setUser(res.data.user);
    });

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const formatted = data
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            desc: item.description,
            price: item.price,
            cat: item.category,
            catLabel: item.categoryLabel || item.category_label,
            art: (item.artSvgKey || item.art_svg_key) as any,
            stock: item.stock,
            isLimited: !!item.isLimited || !!item.is_limited,
            isCustomizable: !!item.isCustomizable || !!item.is_customizable,
          }))
          .filter((p: Product) => p.isCustomizable);
        
        setProducts(formatted);
        if (formatted.length > 0) {
          setSelectedProduct(formatted[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        fly('Error fetching products catalog.');
        setLoading(false);
      });
  }, []);

  const handleAddToCart = async () => {
    if (!user) {
      fly('Please login or register on the homepage to add items to your cart.');
      return;
    }
    if (!selectedProduct) return;
    setAdding(true);

    try {
      const stored = localStorage.getItem('aura_cart');
      const cart = stored ? JSON.parse(stored) : [];

      const found = cart.find(
        (c: any) =>
          c.pid === selectedProduct.id &&
          c.size === selectedSize &&
          c.color === selectedColor.name &&
          c.customText === customText
      );

      if (found) {
        found.qty++;
      } else {
        cart.push({
          pid: selectedProduct.id,
          name: `${selectedProduct.name} (Custom)`,
          price: selectedProduct.price,
          art: selectedProduct.art,
          size: selectedSize,
          qty: 1,
          color: selectedColor.name,
          customText: customText.trim() || undefined
        });
      }

      localStorage.setItem('aura_cart', JSON.stringify(cart));
      fly(`${selectedProduct.name} Custom added to cart.`);
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (_) {
      fly('Failed to update cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c0c0e', color: '#ece8e1' }}>
        <p style={{ fontFamily: '"Anton", sans-serif', letterSpacing: '0.15em', fontSize: '1.2rem' }}>ALIGNING CUSTOMIZER WORKSPACE...</p>
      </div>
    );
  }

  return (
    <>
      {/* Background grain */}
      <div id="grain" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
        backgroundSize: '256px 256px',
      }} />

      {/* Toast popup */}
      <div className={`toast ${toastShow ? 'show' : ''}`} style={{
        position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
        background: 'var(--ink, #161619)', border: '1px solid var(--red, #e10600)',
        padding: '12px 24px', color: '#ece8e1', zIndex: 300, borderRadius: '8px',
        fontFamily: '"Inter Tight", sans-serif', fontSize: '0.85rem', letterSpacing: '0.04em',
        transition: 'all 0.3s ease', opacity: toastShow ? 1 : 0, pointerEvents: toastShow ? 'auto' : 'none'
      }}>
        {toastMessage}
      </div>

      <main style={{
        minHeight: '100vh',
        background: '#0c0c0e',
        color: '#ece8e1',
        padding: '40px 24px 80px',
        position: 'relative',
        zIndex: 1,
        fontFamily: '"Inter Tight", sans-serif'
      }}>
        
        {/* Navigation */}
        <div style={{ maxWidth: '1200px', margin: '0 auto 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            color: 'rgba(236,232,225,0.4)', textDecoration: 'none',
            fontFamily: '"Anton", sans-serif', fontSize: '0.7rem',
            letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'color 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.color = '#ece8e1'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(236,232,225,0.4)'}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Storefront
          </a>
          <div style={{ fontFamily: '"Anton", sans-serif', letterSpacing: '0.3em', fontSize: '0.85rem', color: '#e10600' }}>
            AURA CUSTOM LABS
          </div>
        </div>

        {/* Builder grid split */}
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px', alignItems: 'start'
        }}>

          {/* Left preview section */}
          <div style={{
            background: 'linear-gradient(135deg, #161619, #0c0c0e)',
            border: '1px solid #232327', borderRadius: '20px',
            padding: '30px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', minHeight: '420px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)', position: 'sticky', top: '40px'
          }}>
            <div style={{ width: '100%', maxWidth: '280px', aspectRatio: '200/220', margin: '20px 0' }}>
              {selectedProduct && (
                <div style={{ width: '100%', height: '100%' }}
                  dangerouslySetInnerHTML={{ __html: SVGS[selectedProduct.art](selectedColor.hex, customText) }}
                />
              )}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div style={{
                fontFamily: '"Anton", sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em',
                color: '#e10600', textTransform: 'uppercase', marginBottom: '6px'
              }}>
                Live Interactive Render
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(236,232,225,0.4)', fontStyle: 'italic', fontFamily: '"EB Garamond", serif' }}>
                Base Garment: {selectedProduct?.name} &middot; Color: {selectedColor.name} &middot; Size: {selectedSize}
              </div>
            </div>
          </div>

          {/* Right settings form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Header description */}
            <div>
              <h1 style={{ fontFamily: '"Anton", sans-serif', fontSize: '2.5rem', lineHeight: '1.1', textTransform: 'uppercase', marginBottom: '14px' }}>
                Build Your Own<br/>
                <span style={{ color: '#e10600' }}>Custom Piece</span>
              </h1>
              <p style={{ fontFamily: '"EB Garamond", serif', fontStyle: 'italic', color: 'rgba(236,232,225,0.5)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Pick from our customizable blanks catalog. Personalize with curated color schemes and your choice of custom mark text chest print. Standard pricing applies.
              </p>
            </div>

            {/* Selector: Base Garment */}
            <div>
              <label style={{ display: 'block', fontFamily: '"Anton", sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(236,232,225,0.5)', marginBottom: '12px' }}>
                1. Select Base Garment
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    style={{
                      background: selectedProduct?.id === p.id ? '#161619' : 'transparent',
                      border: selectedProduct?.id === p.id ? '1px solid #e10600' : '1px solid #232327',
                      borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%', color: '#ece8e1'
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: '"Anton", sans-serif', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(236,232,225,0.4)', marginTop: '4px' }}>
                        {p.desc}
                      </div>
                    </div>
                    <b style={{ fontFamily: '"Anton", sans-serif', fontSize: '0.9rem', color: selectedProduct?.id === p.id ? '#e10600' : '#ece8e1' }}>
                      ₹{p.price.toLocaleString('en-IN')}
                    </b>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector: Color */}
            <div>
              <label style={{ display: 'block', fontFamily: '"Anton", sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(236,232,225,0.5)', marginBottom: '12px' }}>
                2. Select Colorway
              </label>
              <div style={{ display: 'flex', gap: '14px' }}>
                {COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    style={{
                      background: 'transparent', border: '0', padding: '0', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%', background: c.hex,
                      border: selectedColor.name === c.name ? '2px solid #e10600' : '2px solid transparent',
                      outline: selectedColor.name === c.name ? '1px solid #e10600' : '1px solid #232327',
                      outlineOffset: '2px', transition: 'all 0.2s'
                    }} />
                    <span style={{ fontSize: '0.7rem', color: selectedColor.name === c.name ? '#ece8e1' : 'rgba(236,232,225,0.4)', fontFamily: '"Anton", sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input: Custom Text */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <label style={{ fontFamily: '"Anton", sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(236,232,225,0.5)' }}>
                  3. Chest Print Text (Optional)
                </label>
                <span style={{ fontSize: '0.65rem', color: customText.length >= 20 ? '#e10600' : 'rgba(236,232,225,0.4)' }}>
                  {customText.length}/20 chars
                </span>
              </div>
              <div style={{
                background: '#0c0c0e', border: '1px solid #232327', borderRadius: '12px',
                padding: '4px 14px', display: 'flex', alignItems: 'center', width: '100%'
              }}>
                <input
                  type="text"
                  placeholder="Enter text (e.g. AURA)"
                  maxLength={20}
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  style={{
                    width: '100%', background: 'transparent', border: '0', color: '#ece8e1',
                    padding: '10px 0', fontFamily: 'inherit', outline: 'none', fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            {/* Selector: Size */}
            <div>
              <label style={{ display: 'block', fontFamily: '"Anton", sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(236,232,225,0.5)', marginBottom: '12px' }}>
                4. Select Size
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      flex: 1, padding: '12px 0', cursor: 'pointer',
                      background: selectedSize === sz ? '#ece8e1' : 'transparent',
                      color: selectedSize === sz ? '#0c0c0e' : '#ece8e1',
                      border: selectedSize === sz ? '1px solid #ece8e1' : '1px solid #232327',
                      borderRadius: '8px', fontFamily: '"Anton", sans-serif', fontSize: '0.75rem',
                      letterSpacing: '0.1em', transition: 'all 0.2s'
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={handleAddToCart}
                disabled={adding || !selectedProduct}
                style={{
                  width: '100%', background: '#e10600', color: '#0c0c0e', border: '0',
                  borderRadius: '12px', padding: '16px 20px', fontFamily: '"Anton", sans-serif',
                  fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', gap: '8px'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ff0a00'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#e10600'; }}
              >
                {adding ? 'Securing Item details...' : `Add to Cart — ₹${selectedProduct ? selectedProduct.price.toLocaleString('en-IN') : '0'}`}
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Styled Fonts and base styling helper */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter+Tight:wght@300;400;500;600&family=EB+Garamond:ital,wght@0,400;1,400&display=swap');

        :root {
          --coal: #0c0c0e;
          --red: #e10600;
          --ink: #161619;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: #0c0c0e;
          overflow-x: hidden;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </>
  );
}
