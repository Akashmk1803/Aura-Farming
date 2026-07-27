"use client";

import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { authClient } from '@/lib/auth-client';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51NpxXhSFg0WkGypYwK8j7h6g5f4d3s2a1qW2e3r4t5y6u7i8o9p0AURA');

// Hardcoded premium SVG models exactly matching client catalog designs
const SVGS = {
  hoodie: '<svg viewBox="0 0 200 220"><path d="M62 52 Q58 30 78 22 Q100 12 122 22 Q142 30 138 52 L162 62 Q176 68 178 84 L186 150 Q187 160 177 162 L156 166 Q149 167 148 158 L144 120 L144 196 Q144 206 134 206 L66 206 Q56 206 56 196 L56 120 L52 158 Q51 167 44 166 L23 162 Q13 160 14 150 L22 84 Q24 68 38 62 Z" fill="#17171a" stroke="#2c2c31" stroke-width="2"/><path d="M74 40 Q100 62 126 40 Q120 66 100 66 Q80 66 74 40Z" fill="#0d0d0f" stroke="#2c2c31" stroke-width="2"/><path d="M92 66 V96 M108 66 V96" stroke="#3a1214" stroke-width="4" stroke-linecap="round"/><rect x="70" y="176" width="60" height="14" rx="4" fill="#0f0f11" stroke="#2c2c31"/><svg x="72" y="92" width="56" height="76" viewBox="0 0 100 140" style="color:#e10600"><use href="#rune"/></svg></svg>',
  tee: '<svg viewBox="0 0 200 220"><path d="M70 34 Q84 26 100 26 Q116 26 130 34 L168 52 Q176 56 173 65 L162 90 Q159 97 151 94 L138 88 L140 192 Q140 202 130 202 L70 202 Q60 202 60 192 L62 88 L49 94 Q41 97 38 90 L27 65 Q24 56 32 52 Z" fill="#18181b" stroke="#2c2c31" stroke-width="2"/><path d="M84 32 Q100 44 116 32" fill="none" stroke="#2c2c31" stroke-width="2"/><svg x="70" y="74" width="60" height="82" viewBox="0 0 100 140" style="color:#e10600"><use href="#rune"/></svg><text x="100" y="184" text-anchor="middle" fill="#7c7872" font-size="10" font-family="Anton" letter-spacing="4">AURA FARMING</text></svg>',
  jacket: '<svg viewBox="0 0 200 220"><path d="M64 44 L88 30 Q100 24 112 30 L136 44 L164 58 Q174 63 175 74 L180 148 Q181 158 171 159 L152 162 Q145 163 144 154 L142 118 L142 194 Q142 204 132 204 L68 204 Q58 204 58 194 L58 118 L56 154 Q55 163 48 162 L29 159 Q19 158 20 148 L25 74 Q26 63 36 58 Z" fill="#121215" stroke="#2c2c31" stroke-width="2"/><path d="M88 30 L100 58 L112 30" fill="#0b0b0d" stroke="#2c2c31" stroke-width="2"/><path d="M100 58 V204" stroke="#2c2c31" stroke-width="3"/><path d="M58 150 H142" stroke="#e10600" stroke-width="3"/><path d="M58 158 H142" stroke="#8f0400" stroke-width="1.5"/><rect x="64" y="96" width="14" height="20" fill="#0b0b0d" stroke="#2c2c31"/><rect x="122" y="96" width="14" height="20" fill="#0b0b0d" stroke="#2c2c31"/><svg x="106" y="74" width="26" height="36" viewBox="0 0 100 140" style="color:#e10600"><use href="#rune"/></svg></svg>',
  cargo: '<svg viewBox="0 0 200 220"><path d="M66 22 L134 22 Q140 22 140 30 L146 196 Q146 204 138 204 L116 204 Q108 204 108 196 L102 96 L98 96 L92 196 Q92 204 84 204 L62 204 Q54 204 54 196 L60 30 Q60 22 66 22Z" fill="#17171a" stroke="#2c2c31" stroke-width="2"/><rect x="60" y="30" width="80" height="10" fill="#0d0d0f" stroke="#2c2c31"/><path d="M58 108 L90 106 L88 138 L58 140 Z" fill="#0f0f11" stroke="#2c2c31" stroke-width="2"/><path d="M110 106 L142 108 L142 140 L112 138 Z" fill="#0f0f11" stroke="#2c2c31" stroke-width="2"/><path d="M58 122 H90 M110 122 H142" stroke="#e10600" stroke-width="2"/><svg x="120" y="160" width="18" height="26" viewBox="0 0 100 140" style="color:#e10600"><use href="#rune"/></svg></svg>',
  cap: '<svg viewBox="0 0 200 220"><path d="M46 118 Q46 58 100 58 Q154 58 154 118 L154 128 L46 128 Z" fill="#17171a" stroke="#2c2c31" stroke-width="2"/><path d="M46 128 Q100 112 154 128 L188 140 Q196 143 190 150 Q160 168 100 150 Q70 142 46 128Z" fill="#0f0f11" stroke="#2c2c31" stroke-width="2"/><path d="M100 58 Q96 90 96 122 M100 58 Q126 76 138 118" fill="none" stroke="#232327" stroke-width="2"/><svg x="84" y="78" width="30" height="42" viewBox="0 0 100 140" style="color:#e10600"><use href="#rune"/></svg></svg>',
  longsleeve: '<svg viewBox="0 0 200 220"><path d="M72 34 Q86 26 100 26 Q114 26 128 34 L158 48 Q168 53 169 64 L176 168 Q177 178 167 179 L150 181 Q142 182 141 173 L138 96 L138 194 Q138 202 130 202 L70 202 Q62 202 62 194 L62 96 L59 173 Q58 182 50 181 L33 179 Q23 178 24 168 L31 64 Q32 53 42 48 Z" fill="#18181b" stroke="#2c2c31" stroke-width="2"/><path d="M86 32 Q100 42 114 32" fill="none" stroke="#2c2c31" stroke-width="2"/><path d="M24 168 L59 166 M141 166 L176 168" stroke="#e10600" stroke-width="2.5"/><circle cx="100" cy="112" r="34" fill="none" stroke="#e10600" stroke-width="2.5"/><svg x="78" y="84" width="44" height="58" viewBox="0 0 100 140" style="color:#e10600"><use href="#rune"/></svg></svg>'
};

interface Product {
  id: string;
  name: string;
  desc: string;
  price: number;
  cat: string;
  catLabel: string;
  art: keyof typeof SVGS;
  stock: number;
  isLimited: boolean;
  isCustomizable: boolean;
}

interface CartItem {
  pid: string;
  name: string;
  price: number;
  art: keyof typeof SVGS;
  size: string;
  qty: number;
}

interface OrderItem {
  id: number;
  productId: string;
  size: string;
  quantity: number;
  price: number;
  name: string;
  artSvgKey: keyof typeof SVGS;
}

interface Order {
  id: string;
  shipping_name: string;
  shipping_address: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

// ─── Shared card visualizer (used by both mock and real forms) ───────────────
function CardVisualizer({ cardHolder, cardFlipped, cardBrand }: { cardHolder: string; cardFlipped: boolean; cardBrand: string }) {
  return (
    <div style={{ perspective: '1000px', width: '100%', aspectRatio: '280/160', margin: '10px 0 16px', userSelect: 'none' }}>
      <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, var(--coal2), var(--ink))', border: '1px solid var(--hair2)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '32px', background: 'rgba(236,232,225,0.12)', borderRadius: '6px' }} />
            <div style={{ fontFamily: 'var(--disp)', fontSize: '0.9rem', color: 'var(--bone)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{cardBrand}</div>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '1.15rem', letterSpacing: '0.15em', color: 'var(--bone)' }}>•••• •••• •••• ••••</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ minWidth: 0, flex: 1, paddingRight: '10px' }}>
              <div style={{ fontSize: '0.48rem', textTransform: 'uppercase', color: 'var(--dim2)', letterSpacing: '0.1em', marginBottom: '2px' }}>Cardholder</div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--bone)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cardHolder}</div>
            </div>
            <div style={{ flex: '0 0 auto' }}>
              <div style={{ fontSize: '0.48rem', textTransform: 'uppercase', color: 'var(--dim2)', letterSpacing: '0.1em', marginBottom: '2px' }}>Expires</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--bone)', letterSpacing: '0.05em' }}>MM/YY</div>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, var(--ink), var(--coal))', border: '1px solid var(--hair2)', borderRadius: '16px', padding: '20px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ width: '100%', height: '38px', background: '#000', marginTop: '10px' }} />
          <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '0.5rem', textTransform: 'uppercase', color: 'var(--dim2)', letterSpacing: '0.1em' }}>CVV</div>
            <div style={{ width: '54px', height: '30px', background: 'var(--bone)', color: 'var(--ink)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700 }}>•••</div>
          </div>
          <div style={{ padding: '0 20px', fontSize: '0.55rem', color: 'var(--dim2)', textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Wear the mark. Align details.</div>
        </div>
      </div>
    </div>
  );
}

// ─── MOCK payment form — NO Stripe hooks, plain HTML inputs ──────────────────
function MockPaymentForm({ total, shippingName, onSuccess, onBack }: { total: number; shippingName: string; onSuccess: () => void; onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [cardHolder, setCardHolder] = useState(shippingName.toUpperCase() || 'AURA INITIATE');
  const [cardFlipped, setCardFlipped] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ background: 'rgba(225,6,0,0.07)', border: '1px solid rgba(225,6,0,0.25)', borderRadius: '10px', padding: '8px 14px', fontSize: '0.7rem', color: 'var(--red)', letterSpacing: '0.04em' }}>
        ⚡ Demo mode — no real payment is processed
      </div>
      <CardVisualizer cardHolder={cardHolder} cardFlipped={cardFlipped} cardBrand="DEMO" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="foot-label">Card Number</label>
          <div className="notify-box" style={{ borderRadius: '12px', padding: '0', background: 'var(--ink)', border: '1px solid var(--hair2)' }}>
            <input type="text" defaultValue="4242 4242 4242 4242" style={{ padding: '10px 14px', background: 'transparent', border: '0', color: 'var(--bone)', width: '100%' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="foot-label">Cardholder Name</label>
          <div className="notify-box" style={{ borderRadius: '12px', padding: '0', background: 'var(--ink)' }}>
            <input type="text" value={cardHolder} onChange={e => setCardHolder(e.target.value.toUpperCase() || 'AURA INITIATE')} required style={{ padding: '10px 14px', background: 'transparent', border: '0', color: 'var(--bone)' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="foot-label">Expiry Date</label>
            <div className="notify-box" style={{ borderRadius: '12px', padding: '0', background: 'var(--ink)', border: '1px solid var(--hair2)' }}>
              <input type="text" defaultValue="12/28" style={{ padding: '10px 14px', background: 'transparent', border: '0', color: 'var(--bone)', width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="foot-label">CVV / Code</label>
            <div className="notify-box" style={{ borderRadius: '12px', padding: '0', background: 'var(--ink)', border: '1px solid var(--hair2)' }}>
              <input type="password" defaultValue="123" onFocus={() => setCardFlipped(true)} onBlur={() => setCardFlipped(false)} style={{ padding: '10px 14px', background: 'transparent', border: '0', color: 'var(--bone)', width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
      <button className="checkout" type="submit" disabled={loading}>
        {loading ? 'Processing initiation details...' : `Pay ₹${total.toLocaleString('en-IN')}`}
      </button>
      <button className="icon-btn" type="button" onClick={onBack} style={{ margin: '0 auto', fontSize: '0.62rem', color: 'var(--dim)' }}>
        ← Back to Shipping
      </button>
    </form>
  );
}

// ─── REAL Stripe form — must be rendered inside <Elements> provider ───────────
function RealStripeForm({ clientSecret, orderId, total, shippingName, onSuccess, onBack }: { clientSecret: string; orderId: string; total: number; shippingName: string; onSuccess: () => void; onBack: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cardHolder, setCardHolder] = useState(shippingName.toUpperCase() || 'AURA INITIATE');
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardBrand, setCardBrand] = useState('AURA CARD');

  const stripeElementStyle = { style: { base: { color: '#ece8e1', fontFamily: '"Inter Tight", sans-serif', fontSize: '14px', lineHeight: '24px', '::placeholder': { color: '#65625e' } }, invalid: { color: '#e10600' } } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setErrorMessage('');
    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) return;
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardNumberElement, billing_details: { name: shippingName } } });
    if (error) {
      setErrorMessage(error.message || 'Payment initiation failed.');
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await fetch('/api/webhooks/stripe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'payment_intent.succeeded', data: { object: { id: paymentIntent.id, metadata: { orderId } } } }) });
      } catch (err) { console.error('Webhook trigger warning:', err); }
      onSuccess();
    } else {
      setErrorMessage('Unexpected transaction status.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <CardVisualizer cardHolder={cardHolder} cardFlipped={cardFlipped} cardBrand={cardBrand} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="foot-label">Card Number</label>
          <div className="notify-box" style={{ borderRadius: '12px', padding: '10px 14px', background: 'var(--ink)', border: '1px solid var(--hair2)' }}>
            <CardNumberElement options={stripeElementStyle} onChange={e => { if (e.brand) setCardBrand(e.brand.toUpperCase()); }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="foot-label">Cardholder Name</label>
          <div className="notify-box" style={{ borderRadius: '12px', padding: '0', background: 'var(--ink)' }}>
            <input type="text" placeholder="Akash" value={cardHolder} onChange={e => setCardHolder(e.target.value.toUpperCase() || 'AURA INITIATE')} required style={{ padding: '10px 14px', background: 'transparent', border: '0', color: 'var(--bone)' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="foot-label">Expiry Date</label>
            <div className="notify-box" style={{ borderRadius: '12px', padding: '10px 14px', background: 'var(--ink)', border: '1px solid var(--hair2)' }}>
              <CardExpiryElement options={stripeElementStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="foot-label">CVV / Code</label>
            <div className="notify-box" style={{ borderRadius: '12px', padding: '10px 14px', background: 'var(--ink)', border: '1px solid var(--hair2)' }}>
              <CardCvcElement options={stripeElementStyle} onFocus={() => setCardFlipped(true)} onBlur={() => setCardFlipped(false)} />
            </div>
          </div>
        </div>
      </div>
      {errorMessage && <div style={{ color: 'var(--red)', fontSize: '0.8rem', textAlign: 'center', marginTop: '4px' }}>{errorMessage}</div>}
      <button className="checkout" id="submitPaymentBtn" type="submit" disabled={loading || !stripe}>
        {loading ? 'Processing initiation details...' : `Pay ₹${total.toLocaleString('en-IN')}`}
      </button>
      <button className="icon-btn" id="backToShippingBtn" type="button" onClick={onBack} style={{ margin: '0 auto', gap: '4px', fontSize: '0.62rem', color: 'var(--dim)' }}>
        ← Back to Shipping
      </button>
    </form>
  );
}

export default function Storefront() {
  const splitWord = (word: string, rowIndex: number) => {
    return word.split('').map((char, charIndex) => {
      const delay = `${0.12 + rowIndex * 0.13 + charIndex * 0.035}s`;
      return (
        <span key={charIndex} className="ch" style={{ animationDelay: delay }}>
          {char}
        </span>
      );
    });
  };

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [activeCat, setActiveCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cardSizes, setCardSizes] = useState<Record<string, string>>({});
  
  // Auth drawer states
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'profile'>('login');
  const [user, setUser] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  // Update Settings drawer form inputs
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [updateName, setUpdateName] = useState('');
  const [updateAddress, setUpdateAddress] = useState('');
  const [updateCurrentPassword, setUpdateCurrentPassword] = useState('');
  const [updateNewPassword, setUpdateNewPassword] = useState('');

  // Admin Portal Drawer states
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminStats, setAdminStats] = useState<any>(null);

  // Wishlist states
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // Auth credential inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Details Modal states
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [detailSize, setDetailSize] = useState('M');

  // Checkout Wizard states
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment'>('cart');
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [checkoutOrderId, setCheckoutOrderId] = useState('');
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [isMockPayment, setIsMockPayment] = useState(false);

  // Tracking Portal states
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [trackingOrderData, setTrackingOrderData] = useState<Order | null>(null);

  // Toast notifications
  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Ref nodes
  const threadSvgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const ghostRef = useRef<SVGPathElement>(null);
  const bloomRef = useRef<SVGPathElement>(null);
  const flowRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const tipGlowRef = useRef<SVGCircleElement>(null);
  const cardRefs = useRef<{ [key: string]: HTMLElement | null }>({});

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

  // Load catalog products from database
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((item: any) => ({
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
        }));
        setProductsList(formatted);
      })
      .catch(() => fly('Offline mode: Could not fetch catalog.'));

    // Verify authenticated user session
    authClient.getSession()
      .then(res => {
        if (res.data) {
          setUser(res.data.user);
          setUpdateName(res.data.user.name);
          setUpdateAddress((res.data.user as any).shippingAddress || '');
          fetchOrders();
          fetchWishlist();
        }
      });

    // Sync cart from browser localStorage
    try {
      const stored = localStorage.getItem('aura_cart');
      if (stored) setCart(JSON.parse(stored));
    } catch (_) {}

    // Sync search history from browser localStorage
    try {
      const storedHistory = localStorage.getItem('aura_search_history');
      if (storedHistory) setSearchHistory(JSON.parse(storedHistory));
    } catch (_) {}
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/my-orders');
      if (res.ok) {
        const data = await res.json();
        setUserOrders(data);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data);
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch (err) {
      console.error('Error loading admin stats:', err);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      setAuthMode('login');
      setAuthOpen(true);
      fly('Please login or register to favorite items');
      return;
    }
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        const data = await res.json();
        fly(data.message);
        fetchWishlist();
      }
    } catch (_) {
      fly('Error updating favorites');
    }
  };

  const addToSearchHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== trimmed.toLowerCase());
      const nextHistory = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem('aura_search_history', JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  const removeFromSearchHistory = (term: string) => {
    setSearchHistory(prev => {
      const nextHistory = prev.filter(t => t !== term);
      localStorage.setItem('aura_search_history', JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('aura_search_history');
  };

  // Trigger login authClient email submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      fly('Email and password credentials are required.');
      return;
    }
    const { data, error } = await authClient.signIn.email({
      email: loginEmail,
      password: loginPassword
    });

    if (error) {
      fly(error.message || 'Login details invalid.');
    } else {
      setUser(data.user);
      setUpdateName(data.user.name);
      setUpdateAddress((data.user as any).shippingAddress || '');
      fly(`Initiation authenticated: welcome back, ${data.user.name}`);
      fetchOrders();
      fetchWishlist();
      setAuthOpen(false);
      setLoginEmail('');
      setLoginPassword('');
    }
  };

  // Trigger registration authClient submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      fly('All inputs are required.');
      return;
    }
    const { data, error } = await authClient.signUp.email({
      name: regName,
      email: regEmail,
      password: regPassword
    });

    if (error) {
      fly(error.message || 'Registration failed.');
    } else {
      setUser(data.user);
      setUpdateName(data.user.name);
      setUpdateAddress((data.user as any).shippingAddress || '');
      fly(`Registration complete. Welcome to Aura Farming, ${data.user.name}`);
      fetchWishlist();
      setAuthOpen(false);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
    }
  };

  // Trigger user profile name updates
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateName) {
      fly('Name cannot be empty.');
      return;
    }
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: updateName, shipping_address: updateAddress })
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, name: data.full_name, shippingAddress: data.shipping_address });
        fly('Profile coordinates updated successfully');
        setSettingsOpen(false);
      } else {
        fly(data.error || 'Failed to update settings');
      }
    } catch (err) {
      fly('Error updating profile');
    }
  };

  // Trigger user account password changes
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateCurrentPassword || !updateNewPassword) {
      fly('Please fill in password credentials.');
      return;
    }
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: updateCurrentPassword, new_password: updateNewPassword })
      });
      const data = await res.json();
      if (res.ok) {
        fly('Password updated successfully');
        setUpdateCurrentPassword('');
        setUpdateNewPassword('');
        setSettingsOpen(false);
      } else {
        fly(data.error || 'Password update failed');
      }
    } catch (err) {
      fly('Error updating password');
    }
  };

  // Trigger account logouts
  const handleLogout = async () => {
    await authClient.signOut();
    setUser(null);
    setUserOrders([]);
    setWishlistItems([]);
    setAdminOpen(false);
    setAuthOpen(false);
    // Clear cart from state AND localStorage so it doesn't rehydrate after login
    setCart([]);
    try { localStorage.removeItem('aura_cart'); } catch (_) {}
    fly('Logged out successfully.');
  };

  // Open admin drawer and always fetch fresh stats
  const openAdminDrawer = () => {
    setAdminOpen(true);
    fetchAdminStats();
  };

  // Checkout POST to create pending order and Stripe PaymentIntent
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutAddress) {
      fly('Recipient name and address are required.');
      return;
    }

    try {
      const payload = {
        shipping_name: checkoutName,
        shipping_address: checkoutAddress,
        items: cart.map(item => ({
          productId: item.pid,
          size: item.size,
          quantity: item.qty
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setClientSecret(data.clientSecret);
        setCheckoutOrderId(data.orderId);
        setCheckoutTotal(data.total);
        setIsMockPayment(!!data.mock);
        setCheckoutStep('payment');
      } else {
        fly(data.error || 'Failed to initialize checkout');
      }
    } catch (err) {
      fly('Checkout connection failed');
    }
  };

  // Admin restock stock updates
  const handleAdminRestock = async (productId: string, currentStock: number) => {
    const inputVal = prompt('Enter new stock quantity:', String(currentStock));
    if (inputVal === null) return;
    const newStock = parseInt(inputVal, 10);
    if (isNaN(newStock) || newStock < 0) {
      fly('Please enter a valid stock number.');
      return;
    }
    try {
      const res = await fetch('/api/admin/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, newStock })
      });
      if (res.ok) {
        fly(`Product ${productId} stock updated to ${newStock}.`);
        fetchAdminStats();
      } else {
        const err = await res.json();
        fly(err.error || 'Failed to update stock.');
      }
    } catch (_) {
      fly('Restock connection error');
    }
  };

  // Admin manual status override updates
  const handleAdminUpdateStatus = async (orderId: string) => {
    const newStatus = prompt('Enter new status (pending/paid/shipped/out_for_delivery/delivered):');
    if (!newStatus) return;
    try {
      const res = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      if (res.ok) {
        fly(`Order status overridden successfully.`);
        fetchAdminStats();
      } else {
        const err = await res.json();
        fly(err.error || 'Failed to override status.');
      }
    } catch (_) {
      fly('Override connection error');
    }
  };

  // Retrieve tracking progress
  const handleTrackingSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingOrderId) return;
    try {
      const res = await fetch(`/api/orders/track/${trackingOrderId}`);
      const data = await res.json();
      if (res.ok) {
        setTrackingOrderData(data);
      } else {
        fly(data.error || 'Order ID not recognized.');
      }
    } catch (_) {
      fly('Tracking connection error.');
    }
  };

  // Helper properties
  const cartQty = cart.reduce((a, c) => a + c.qty, 0);
  const cartSubtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const cartShippingFee = cartSubtotal >= 4999 || cartQty === 0 ? 0 : 199;
  const cartTotal = cartSubtotal + cartShippingFee;

  const updateLocalStorage = (newCart: CartItem[]) => {
    try {
      localStorage.setItem('aura_cart', JSON.stringify(newCart));
    } catch (_) {}
  };

  const addToCart = (p: Product, size: string) => {
    if (!user) {
      setAuthMode('login');
      setAuthOpen(true);
      fly('Please login or register to add items to your cart');
      return;
    }
    const updated = [...cart];
    const found = updated.find(c => c.pid === p.id && c.size === size);
    if (found) {
      found.qty++;
    } else {
      updated.push({ pid: p.id, name: p.name, price: p.price, art: p.art, size: size, qty: 1 });
    }
    setCart(updated);
    updateLocalStorage(updated);
    fly(`${p.name} added to cart`);
  };

  const handleQtyChange = (idx: number, delta: number) => {
    const updated = [...cart];
    updated[idx].qty += delta;
    if (updated[idx].qty <= 0) {
      updated.splice(idx, 1);
    }
    setCart(updated);
    updateLocalStorage(updated);
  };

  const handleRemoveItem = (idx: number) => {
    const updated = [...cart];
    updated.splice(idx, 1);
    setCart(updated);
    updateLocalStorage(updated);
  };

  // Weave Background dynamic Catmull-Rom math path builder
  const buildThread = () => {
    if (!threadSvgRef.current || !lineRef.current) return;
    const siteFoot = document.querySelector('footer');
    if (!siteFoot) return;
    const Ht = Math.ceil(siteFoot.getBoundingClientRect().bottom + window.scrollY);
    const Wt = window.innerWidth;
    threadSvgRef.current.setAttribute('width', String(Wt));
    threadSvgRef.current.setAttribute('height', String(Ht));
    const cx = Wt / 2;
    const amp = Math.min(Wt * 0.20, 260);
    const lx = cx - amp;
    const rx = cx + amp;

    const pts: [number, number][] = [[cx, window.innerHeight * 0.86]];

    // Capture nodes positions
    document.querySelectorAll('[data-thread]').forEach(el => {
      const side = el.getAttribute('data-thread');
      const r = el.getBoundingClientRect();
      const y = r.top + window.scrollY;
      const h = r.height;
      if (side === 'end') {
        const node = document.getElementById('footNode');
        if (node) {
          const nb = node.getBoundingClientRect();
          const ny = nb.top + window.scrollY + nb.height / 2;
          const ncx = nb.left + nb.width / 2;
          pts.push([ncx, ny - 70]);
          const R = 26;
          pts.push([ncx, ny - R]);
          pts.push([ncx + R * 0.92, ny]);
          pts.push([ncx, ny + R]);
          pts.push([ncx - R * 0.92, ny]);
          pts.push([ncx, ny - R * 0.6]);
        } else {
          pts.push([cx, y + Math.min(h * 0.5, 120)]);
        }
      } else if (side === 'left') {
        pts.push([lx, y + h * 0.32]);
        pts.push([cx, y + h * 0.72]);
      } else if (side === 'right') {
        pts.push([rx, y + h * 0.42]);
        pts.push([cx, y + h * 0.86]);
      } else {
        pts.push([cx, y + h * 0.5]);
      }
    });

    if (pts.length < 2) return;

    // Cubic bezier path builder
    const d3 = (a: number) => Math.round(a * 10) / 10;
    let d = `M ${d3(pts[0][0])} ${d3(pts[0][1])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${d3(c1x)} ${d3(c1y)}, ${d3(c2x)} ${d3(c2y)}, ${d3(p2[0])} ${d3(p2[1])}`;
    }

    [lineRef.current, ghostRef.current, bloomRef.current, flowRef.current].forEach(path => {
      if (path) path.setAttribute('d', d);
    });

    const totalLength = lineRef.current.getTotalLength();
    lineRef.current.style.strokeDasharray = String(totalLength);
    if (bloomRef.current) {
      bloomRef.current.style.strokeDasharray = String(totalLength);
    }
  };

  // Scroll thread updates
  useEffect(() => {
    buildThread();
    window.addEventListener('resize', buildThread);
    window.addEventListener('scroll', buildThread);
    return () => {
      window.removeEventListener('resize', buildThread);
      window.removeEventListener('scroll', buildThread);
    };
  }, [productsList]);

  // Navbar Hide/Show on Scroll
  useEffect(() => {
    const nav = document.getElementById('nav');
    if (!nav) return;
    let lastY = window.scrollY;
    let navTick = false;

    const handleScroll = () => {
      if (navTick) return;
      navTick = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        nav.classList.toggle('scrolled', y > 40);
        if (!document.body.classList.contains('lock')) {
          if (y > lastY + 6 && y > 260) {
            nav.classList.add('hidden');
          } else if (y < lastY - 6 || y <= 260) {
            nav.classList.remove('hidden');
          }
        }
        lastY = y;
        navTick = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Tick Thread spline animation loop
  useEffect(() => {
    let animeId: number;
    let drawn = 0;
    let flowOff = 0;
    let flowTick = 0;
    let lastTipY = -1;
    const FLOWLEN = 150;

    const tickThread = () => {
      const line = lineRef.current;
      const bloom = bloomRef.current;
      const flow = flowRef.current;
      const tip = tipRef.current;
      const tipGlow = tipGlowRef.current;

      if (!line || !bloom || !flow || !tip || !tipGlow) {
        animeId = requestAnimationFrame(tickThread);
        return;
      }

      const total = line.getTotalLength() || 0;
      if (total === 0) {
        animeId = requestAnimationFrame(tickThread);
        return;
      }

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, (window.scrollY + window.innerHeight * 0.22) / (max + window.innerHeight * 0.22))) : 1;
      const target = total * p;

      const moving = Math.abs(target - drawn) >= 0.5;
      drawn += (target - drawn) * 0.09;
      if (!moving) drawn = target;

      const tipVisible = lastTipY < 0 || (lastTipY > window.scrollY - 260 && lastTipY < window.scrollY + window.innerHeight + 260);

      if (moving || tipVisible) {
        const off = Math.max(0, total - drawn);
        line.style.strokeDashoffset = String(off);
        bloom.style.strokeDashoffset = String(off);

        const dd = Math.min(drawn, total);
        try {
          const pt = line.getPointAtLength(dd);
          lastTipY = pt.y;
          tip.setAttribute('cx', String(pt.x));
          tip.setAttribute('cy', String(pt.y));
          tipGlow.setAttribute('cx', String(pt.x));
          tipGlow.setAttribute('cy', String(pt.y));

          if (dd > 40 && tipVisible) {
            flowTick = (flowTick + 1) & 1;
            if (flowTick === 0) {
              flowOff = (flowOff + 4.4) % (FLOWLEN * 2);
              flow.style.strokeDasharray = `${FLOWLEN * 0.5} ${FLOWLEN * 1.5}`;
              flow.style.strokeDashoffset = String(total - dd + flowOff);
              flow.style.opacity = '0.9';
            }
          } else {
            flow.style.opacity = '0';
          }
        } catch (_) {}
      }

      animeId = requestAnimationFrame(tickThread);
    };

    tickThread();

    return () => {
      cancelAnimationFrame(animeId);
    };
  }, []);

  // Card 3D tilt effects
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest('.card') as HTMLElement;
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add('tilting');
      card.style.setProperty('--ry', `${px * 7}deg`);
      card.style.setProperty('--rx', `${-py * 6}deg`);
    };

    const handleOut = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest('.card') as HTMLElement;
      if (!card || card.contains(e.relatedTarget as Node)) return;
      card.classList.remove('tilting');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    };

    const gridNode = document.getElementById('grid');
    if (gridNode) {
      gridNode.addEventListener('pointermove', handleMove as any);
      gridNode.addEventListener('pointerout', handleOut as any);
    }
    return () => {
      if (gridNode) {
        gridNode.removeEventListener('pointermove', handleMove as any);
        gridNode.removeEventListener('pointerout', handleOut as any);
      }
    };
  }, [productsList]);

  // Embers Canvas header particles animation
  useEffect(() => {
    const cv = document.getElementById('embers') as HTMLCanvasElement;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let parts: any[] = [];
    let W = 0, H = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const size = () => {
      const hd = document.querySelector('header');
      if (!hd) return;
      W = hd.clientWidth;
      H = hd.clientHeight;
      cv.width = W * DPR;
      cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const seed = () => {
      parts = [];
      const n = Math.min(44, Math.floor(W / 28));
      for (let i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.8 + 0.5,
          s: Math.random() * 0.35 + 0.12,
          d: Math.random() * 0.4 - 0.2,
          a: Math.random() * 0.5 + 0.2,
          t: Math.random() * 6
        });
      }
    };

    size();
    seed();

    let animeId: number;
    ctx.shadowColor = 'rgba(225,6,0,.55)';

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.shadowBlur = 6;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.y -= p.s;
        p.x += Math.sin((p.t += 0.01)) * 0.2 + p.d * 0.3;
        if (p.y < -6) {
          p.y = H + 6;
          p.x = Math.random() * W;
        }
        const fl = 0.6 + Math.sin(p.t * 3) * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.28);
        ctx.fillStyle = `rgba(225,${Math.floor(20 + fl * 40)},0,${p.a * fl})`;
        ctx.fill();
      }
      animeId = requestAnimationFrame(loop);
    };

    loop();
    window.addEventListener('resize', size);

    return () => {
      cancelAnimationFrame(animeId);
      window.removeEventListener('resize', size);
    };
  }, []);

  // Hero Parallax Effect
  useEffect(() => {
    const heroEl = document.querySelector('header');
    const heroMark = document.querySelector('.hero-mark') as HTMLElement;
    const heroGlow = document.querySelector('.hero-glow') as HTMLElement;
    const heroInner = document.querySelector('.hero-inner') as HTMLElement;
    if (!heroEl || !heroMark || !heroGlow || !heroInner) return;

    let mx = 0, my = 0, tmx = 0, tmy = 0;
    let animeId: number;
    let lastY = -1;
    let settled = false;

    const handlePointerMove = (e: PointerEvent) => {
      const r = heroEl.getBoundingClientRect();
      tmx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tmy = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };

    const handlePointerLeave = () => {
      tmx = 0;
      tmy = 0;
    };

    heroEl.addEventListener('pointermove', handlePointerMove);
    heroEl.addEventListener('pointerleave', handlePointerLeave);

    const parallaxLoop = () => {
      const y = window.scrollY;
      const hh = heroEl.offsetHeight || 1;
      const p = Math.min(1, y / hh);
      
      const pdx = tmx - mx;
      const pdy = tmy - my;
      mx += pdx * 0.06;
      my += pdy * 0.06;

      const pointerActive = Math.abs(pdx) > 0.001 || Math.abs(pdy) > 0.001;
      if (y !== lastY || pointerActive || !settled) {
        heroMark.style.marginLeft = `${mx * 16}px`;
        heroMark.style.marginTop = `${y * 0.16 + my * 12 - 8}px`;
        heroGlow.style.marginTop = `${y * 0.10}px`;
        heroInner.style.transform = `translateY(${y * 0.22}px)`;
        heroInner.style.opacity = String(Math.max(0, 1 - p * 1.15));
        lastY = y;
        settled = !pointerActive && y === lastY;
      }
      animeId = requestAnimationFrame(parallaxLoop);
    };

    parallaxLoop();

    return () => {
      cancelAnimationFrame(animeId);
      heroEl.removeEventListener('pointermove', handlePointerMove);
      heroEl.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  // Filter storefront cards matching search and tab states
  const filteredProducts = productsList.filter(p => {
    let matchesCat: boolean;
    if (activeCat === 'all') matchesCat = true;
    else if (activeCat === 'limited') matchesCat = p.isLimited;
    else if (activeCat === 'customize') matchesCat = p.isCustomizable;
    else matchesCat = p.cat === activeCat;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const limitedCount = productsList.filter(p => p.isLimited).length;

  return (
    <>
      <div id="grain"></div>

      {/* RUNE SVG DEFINITION */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <g id="rune">
            <g fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="square">
              <path d="M50 14 V126"/>
              <path d="M40 24 L50 8 L60 24"/>
              <path d="M14 16 L50 70"/>
              <path d="M86 16 L50 70"/>
              <path d="M50 58 L88 95 L50 132 L12 95 Z"/>
              <path d="M18 64 H82"/>
              <path d="M26 55 V73"/>
              <path d="M74 55 V73"/>
            </g>
          </g>
        </defs>
      </svg>

      {/* WEAVE BACKGROUND LINE */}
      <svg id="thread" ref={threadSvgRef} aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none', left: 0, top: 0, zIndex: 1, width: '100%' }}>
        <defs>
          <linearGradient id="threadGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff2418"/>
            <stop offset=".5" stopColor="#e10600"/>
            <stop offset="1" stopColor="#8f0400"/>
          </linearGradient>
        </defs>
        <path className="ghost" ref={ghostRef} d=""/>
        <path id="threadBloom" ref={bloomRef} d=""/>
        <path id="threadLine" ref={lineRef} d=""/>
        <path id="threadFlow" ref={flowRef} d=""/>
        <circle id="threadTipGlow" ref={tipGlowRef} r="9" cx="-40" cy="-40"/>
        <circle id="threadTip" ref={tipRef} r="4" cx="-40" cy="-40"/>
      </svg>

      {/* NAVBAR */}
      <nav id="nav">
        <a className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} role="button" tabIndex={0} aria-label="Aura Farming home">
          <img src="data:image/png;base64,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"/>
        </a>
        <div className="nav-right">
          <div className={`search-container ${searchOpen ? 'open' : ''}`} style={{ position: 'relative' }}>
            <input
              type="text"
              id="searchInput"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 255)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addToSearchHistory(searchQuery);
                }
              }}
              className={searchOpen ? 'open' : ''}
              aria-label="Search items"
            />
            <button className="icon-btn search-btn" onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) { setTimeout(() => document.getElementById('searchInput')?.focus(), 120); } }} aria-label="Toggle search input">
              <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
                <circle cx="11" cy="11" r="7"/>
                <path d="M21 21l-4.3-4.3"/>
              </svg>
            </button>

            {/* SEARCH SUGGESTIONS & RECENT HISTORY DROPDOWN POPOVER PANEL */}
            {searchOpen && (searchFocused || searchQuery) && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                background: 'rgba(15,15,17,0.96)',
                border: '1px solid var(--hair2)',
                borderRadius: '12px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5), 0 0 1px var(--hair2)',
                padding: '16px',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                textAlign: 'left'
              }} className="search-popover">
                
                {/* RECENT SEARCHES */}
                {searchHistory.length > 0 && !searchQuery && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: 'var(--dim2)', letterSpacing: '0.05em' }}>Recent Searches</span>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearSearchHistory(); }} style={{ background: 'none', border: 0, color: 'var(--red)', fontSize: '0.55rem', cursor: 'pointer', textTransform: 'uppercase' }}>Clear All</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {searchHistory.map((term, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', background: 'var(--coal)', border: '1px solid var(--hair2)', borderRadius: '16px', padding: '4px 10px', gap: '6px' }}>
                          <span
                            onClick={() => setSearchQuery(term)}
                            style={{ fontSize: '0.68rem', color: 'var(--bone)', cursor: 'pointer' }}
                          >
                            {term}
                          </span>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromSearchHistory(term); }}
                            style={{ background: 'none', border: 0, color: 'var(--dim2)', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                            aria-label="Remove search term"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUGGESTED / AUTOCOMPLETE PRODUCTS */}
                {(() => {
                  const filtered = searchQuery 
                    ? productsList.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.cat.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4)
                    : productsList.slice(0, 3); // Featured items if no search term

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: 'var(--dim2)', letterSpacing: '0.05em' }}>
                        {searchQuery ? 'Product Suggestions' : 'Featured Pieces'}
                      </span>
                      {filtered.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {filtered.map(item => (
                            <div
                              key={item.id}
                              onClick={() => {
                                addToSearchHistory(searchQuery || item.name);
                                setDetailProduct(item);
                                setDetailSize(item.cat === 'headwear' ? 'OS' : 'M');
                                setSearchOpen(false);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'rgba(236,232,225,0.02)',
                                border: '1px solid var(--hair)',
                                borderRadius: '8px',
                                padding: '8px 10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              className="suggestion-item"
                            >
                              <div style={{ width: '28px', height: '28px', background: 'var(--coal)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <div style={{ width: '22px', height: '22px', transform: 'scale(0.8)' }} dangerouslySetInnerHTML={{ __html: SVGS[item.art] }}></div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, overflow: 'hidden' }}>
                                <span style={{ fontSize: '0.74rem', color: 'var(--bone)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                                <span style={{ fontSize: '0.64rem', color: 'var(--dim2)' }}>₹{item.price.toLocaleString('en-IN')} &middot; {item.catLabel}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: 'var(--dim2)', fontStyle: 'italic' }}>No matches found.</span>
                      )}
                    </div>
                  );
                })()}

              </div>
            )}
          </div>

          <button className="icon-btn auth-btn" onClick={() => { setAuthMode(user ? 'profile' : 'login'); setAuthOpen(true); }} aria-label="Account">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>{user ? user.name.split(' ')[0] : 'Login'}</span>
          </button>

          <button className="icon-btn wishlist-btn" onClick={() => setWishlistOpen(true)} aria-label="Open wishlist" style={{ position: 'relative' }}>
            <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: wishlistItems.length > 0 ? 'var(--red)' : 'none', stroke: wishlistItems.length > 0 ? 'var(--red)' : 'currentColor', strokeWidth: 2 }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Wishlist{wishlistItems.length > 0 && <span className="cart-count show" style={{ background: 'var(--red)' }}>{wishlistItems.length}</span>}
          </button>

          <button className="icon-btn cart-btn" onClick={() => { setCheckoutStep('cart'); setCartOpen(true); }} aria-label="Open cart">
            <svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
            Cart<span className={`cart-count ${cartQty > 0 ? 'show' : ''}`}>{cartQty}</span>
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header>
        <div className="hero-glow"></div>
        <img className="hero-mark" src="data:image/png;base64,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" alt="" aria-hidden="true" />
        <canvas id="embers" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}></canvas>
        
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <svg className="mark-ico" viewBox="0 0 100 140" aria-hidden="true"><use href="#rune"/></svg>
            <b>Drop 001</b> &middot; Heavyweight Streetwear<span className="est"> &middot; Est. 2026</span>
          </div>
          
          <h1 id="heroTitle">
            <span className="row" data-text="Wear">{splitWord("Wear", 0)}</span>
            <span className="row outline" data-text="The">{splitWord("The", 1)}</span>
            <span className="row red" data-text="Mark.">{splitWord("Mark.", 2)}</span>
          </h1>
          
          <p className="hero-sub">240 GSM blanks. Oversized cuts. Black as the base, <em>one red line</em> running through everything we make.</p>
          
          <div className="hero-ctas">
            <a className="btn btn-red" onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })} role="button" tabIndex={0}>
              Shop Drop 001<span className="arr">&rarr;</span>
            </a>
          </div>
          
          <div className="hero-meta" aria-hidden="true">
            <span><i className="dot"></i>240+ GSM heavyweight</span>
            <span className="sep"></span>
            <span>Six pieces, never restocked</span>
            <span className="sep"></span>
            <span>Ships worldwide</span>
          </div>
        </div>

        <div className="hero-rail l" aria-hidden="true"><span>Aura <b>Farming</b></span><i></i><span>Black &amp; Red</span></div>
        <div className="hero-rail r" aria-hidden="true"><span>Drop <b>001</b></span><i></i><span>Six Pieces</span></div>
        <div className="scroll-cue">Follow the line<i></i></div>
      </header>

      {/* SHOPPING SECTION */}
      <section id="shop" data-thread="left" style={{ position: 'relative', zIndex: 2 }}>
        <div className="sec-head reveal in">
          <div>
            <div className="eyebrow">Drop 001 / The Collection</div>
            <h2>Six Pieces.<br/><span className="red">Zero Restocks.</span></h2>
          </div>
          <p>Every piece carries the mark. Hover any garment to see it spin, pick a size, and add it to your cart.</p>
        </div>

        {/* CATEGORY TABS */}
        <div className="cats reveal in" id="cats">
          {(['all', 'hoodies', 'tees', 'outerwear', 'bottoms', 'headwear'] as const).map(cat => {
            const label = cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1);
            return (
              <button key={cat} className={`cat ${activeCat === cat ? 'on' : ''}`} onClick={() => setActiveCat(cat)}>
                {label}
              </button>
            );
          })}

          {/* Limited tab — keeps count badge */}
          <button
            className={`cat ${activeCat === 'limited' ? 'on' : ''}`}
            onClick={() => setActiveCat('limited')}
          >
            Limited{limitedCount > 0 && <sup>{limitedCount}</sup>}
          </button>

          {/* Customize tab — no badge */}
          <button
            className={`cat ${activeCat === 'customize' ? 'on' : ''}`}
            onClick={() => setActiveCat('customize')}
          >
            Customize
          </button>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid" id="grid">
          {filteredProducts.map(p => {
            const sizes = p.cat === 'headwear' ? ['OS'] : ['S', 'M', 'L', 'XL'];
            return (
              <article key={p.id} className="card reveal in" data-cat={p.cat} data-pid={p.id}>
                <div className="card-media" onClick={() => { setDetailProduct(p); setDetailSize(sizes[0]); }}>
                  <span className="tag">001 / {p.id}</span>
                  <span className="cat-tag">{p.catLabel}</span>
                  <div className="fig">
                    <div className="shadow"></div>
                    <div className="lift">
                      <div className="spin" dangerouslySetInnerHTML={{ __html: SVGS[p.art] }}></div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="top" onClick={() => { setDetailProduct(p); setDetailSize(sizes[0]); }}>
                    <div className="meta">
                      <h3>{p.name}</h3>
                      <div className="desc">{p.desc}</div>
                    </div>
                    <div className="price">₹{p.price.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="sizes">
                    {sizes.map(s => {
                      const activeSize = cardSizes[p.id] || (p.cat === 'headwear' ? 'OS' : 'M');
                      return (
                        <button key={s} className={`size ${s === activeSize ? 'sel' : ''}`} onClick={() => setCardSizes(prev => ({ ...prev, [p.id]: s }))}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  <button className="add" type="button" onClick={() => addToCart(p, cardSizes[p.id] || (p.cat === 'headwear' ? 'OS' : 'M'))}>
                    <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Add to Cart
                  </button>
                </div>
              </article>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="empty" id="empty" style={{ display: 'block' }}>
              Nothing here yet. The archive stays closed.
            </div>
          )}
        </div>
      </section>

      {/* STORY SECTION */}
      <section id="story" data-thread="right" style={{ position: 'relative', zIndex: 2 }}>
        <div className="story-head">
          <div className="eyebrow reveal in">The Mark</div>
          <h2 className="reveal in">Born cursed.<br/><em>Worn proud.</em></h2>
        </div>
        <div className="story-wrap">
          <blockquote className="pull reveal in">Aura isn&apos;t given. It&apos;s farmed. <b>Rep by rep, night by night, stitch by stitch.</b> The red line is the path. Walk it.</blockquote>
          <div className="story-copy reveal in">
            <p><strong>This brand is for the ones building quietly</strong> while everyone else talks. Every garment is cut heavy: 240+ GSM blanks, oversized silhouettes, black as the base, one line of red running through everything we make.</p>
            <p>No paid hype. No restocks. When a drop sells out it becomes part of the archive, and the archive never reopens.</p>
            <ul className="creed" aria-label="What the mark stands for">
              <li><span className="cn">01</span>240+ GSM</li>
              <li><span className="cn">02</span>Oversized Cuts</li>
              <li><span className="cn">03</span>One Red Line</li>
              <li><span className="cn">04</span>Never Restocked</li>
            </ul>
          </div>
        </div>
      </section>

      {/* NEWSLETTER / COUNTDOWN */}
      <section id="notify" data-thread="center" style={{ position: 'relative', zIndex: 2 }}>
        <div className="eyebrow reveal in">Drop 001 &middot; Countdown</div>
        <h2 className="reveal in">The Mark <span className="red">Drops Soon</span></h2>
        <p className="reveal in">First 100 on the list get early access before the public gate opens. One email. No spam. Just the drop.</p>
        <div className="notify-box reveal in">
          <input type="email" placeholder="your@email.com" aria-label="Email address" />
          <button id="notifyBtn" type="button" onClick={() => fly('You are on the list')}>Notify Me</button>
        </div>
        <div id="countdown" className="reveal in">
          <div className="cd"><div className="v">14</div><div className="u">Days</div></div>
          <div className="cd"><div className="v">08</div><div className="u">Hours</div></div>
          <div className="cd"><div className="v">42</div><div className="u">Mins</div></div>
          <div className="cd"><div className="v">00</div><div className="u">Secs</div></div>
        </div>
      </section>

      {/* FOOTER */}
      <footer data-thread="end" style={{ position: 'relative', zIndex: 2 }}>
        <div className="foot-node" id="footNode" aria-hidden="true"><span className="ring"></span><span className="dot"></span></div>
        <div className="foot-grid">
          <div className="foot-brand-col">
            <a className="foot-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} role="button" tabIndex={0} aria-label="Aura Farming home">
              <svg viewBox="0 0 100 140" aria-hidden="true"><use href="#rune"/></svg>
              <span>Aura Farming</span>
            </a>
            <p className="foot-tag">Heavyweight streetwear forged in black and red. One line runs through everything.</p>
            <div className="foot-actions">
              <button className="foot-ig" type="button" aria-label="Instagram" onClick={() => fly('Instagram coming with Drop 001')}>
                <svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2m0 1.8c-3.1 0-3.5 0-4.8.1-1.1.1-1.5.2-1.9.3-.5.2-.8.4-1.1.7-.3.3-.6.6-.7 1.1-.1.4-.3.8-.3 1.9-.1 1.2-.1 1.6-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.5.3 1.9.2.5.4.8.7 1.1.3.3.6.6 1.1.7.4.1.8.3 1.9.3 1.2.1 1.6.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.5-.2 1.9-.3.5-.2.8-.4 1.1-.7.3-.3.6-.6.7-1.1.1-.4.3-.8.3-1.9.1-1.2.1-1.6.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.5-.3-1.9-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.6-1.1-.7-.4-.1-.8-.3-1.9-.3-1.2-.1-1.6-.1-4.8-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zm6.2-8.3a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0z"/></svg>
              </button>
              <button className="foot-chip" type="button" onClick={() => setTrackingOpen(true)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11l2 4h5M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
                Track Order
              </button>
            </div>
          </div>
          <div className="foot-loc">
            <div className="foot-label">Location</div>
            <address className="foot-addr">Chandigarh, IN</address>
            <button className="mini-map" id="miniMap" type="button" aria-label="Store location (preview)" onClick={() => fly('Map is a preview for now.')}>
              <svg className="map-grid" viewBox="0 0 220 120" aria-hidden="true">
                <defs>
                  <linearGradient id="mapFade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="rgba(236,232,225,.10)"/>
                    <stop offset="1" stopColor="rgba(236,232,225,.02)"/>
                  </linearGradient>
                </defs>
                <path className="mroad" d="M0 30 H220 M0 64 H220 M0 96 H220 M40 0 V120 M96 0 V120 M150 0 V120 M196 0 V120"/>
                <path className="mroad diag" d="M0 120 L120 0 M80 120 L220 20"/>
                <circle className="mblip" cx="110" cy="64" r="3"/>
              </svg>
              <span className="map-pin"><i></i></span>
              <span className="map-note">Preview</span>
            </button>
          </div>
        </div>
        <div className="foot-rule"></div>
        <div className="foot-bottom">
          <div className="pay"><span>VISA</span><span>MASTERCARD</span><span>UPI</span><span>PAYTM</span></div>
          <div className="foot-copy">
            &copy; 2026 Aura Farming &middot;{' '}
            {(user as any)?.role === 'admin' && (
              <a onClick={openAdminDrawer} style={{ color: 'var(--dim2)', textDecoration: 'underline', cursor: 'pointer' }}>
                Admin Portal
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* BACKDROP OVERLAY */}
      {(cartOpen || authOpen || adminOpen || detailProduct || trackingOpen || wishlistOpen) && (
        <div className="overlay open" onClick={() => { setCartOpen(false); setAuthOpen(false); setAdminOpen(false); setDetailProduct(null); setTrackingOpen(false); setWishlistOpen(false); }}></div>
      )}

      {/* SHOPPING CART / CHECKOUT DRAWER */}
      <aside className={`cart ${cartOpen ? 'open' : ''}`} style={{ zIndex: 190 }}>
        {checkoutStep === 'cart' ? (
          <>
            <div className="cart-head">
              <h3>Your Cart {cartQty > 0 ? `(${cartQty})` : ''}</h3>
              <button className="cart-close" onClick={() => setCartOpen(false)}>&times;</button>
            </div>
            <div className="cart-items" style={{ padding: '20px 24px' }}>
              {cart.map((c, idx) => (
                <div className="citem" key={`${c.pid}-${c.size}`}>
                  <div className="citem-fig" dangerouslySetInnerHTML={{ __html: SVGS[c.art] }}></div>
                  <div className="citem-info">
                    <h4>{c.name}</h4>
                    <div className="sz">Size {c.size}</div>
                    <button className="rm" onClick={() => handleRemoveItem(idx)}>Remove</button>
                  </div>
                  <div className="citem-right">
                    <div className="citem-price">₹{(c.price * c.qty).toLocaleString('en-IN')}</div>
                    <div className="qty">
                      <button onClick={() => handleQtyChange(idx, -1)}>&minus;</button>
                      <span>{c.qty}</span>
                      <button onClick={() => handleQtyChange(idx, 1)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="cart-empty">
                  <svg viewBox="0 0 24 24" style={{ width: '48px', height: '48px', stroke: 'var(--dim2)', fill: 'none', margin: '0 auto 10px' }}>
                    <path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>
                  </svg>
                  <p>Your cart is empty</p>
                  <small>The mark is waiting. Add a piece to begin.</small>
                </div>
              )}
            </div>
            <div className="cart-foot">
              <div className="cart-row"><span>Subtotal</span><span>₹{cartSubtotal.toLocaleString('en-IN')}</span></div>
              <div className="cart-row"><span>Shipping</span><span>{cartShippingFee === 0 ? 'Free' : `₹${cartShippingFee}`}</span></div>
              <div className="cart-row total"><span>Total</span><b>₹{cartTotal.toLocaleString('en-IN')}</b></div>
              <button className="checkout" disabled={cart.length === 0} onClick={() => {
                if (!user) {
                  setCartOpen(false);
                  setAuthMode('login');
                  setAuthOpen(true);
                  fly('Please login or register to complete your checkout');
                } else {
                  setCheckoutName(user.name);
                  setCheckoutAddress((user as any).shippingAddress || '');
                  setCheckoutStep('shipping');
                }
              }}>
                Checkout<span className="arr">&rarr;</span>
              </button>
              <div className="cart-note">Secure checkout &middot; Free shipping over ₹4,999</div>
            </div>
          </>
        ) : checkoutStep === 'shipping' ? (
          <>
            <div className="cart-head">
              <h3 style={{ fontFamily: 'var(--disp)', textTransform: 'uppercase' }}>Shipping</h3>
              <button className="cart-close" onClick={() => setCheckoutStep('cart')}>&larr;</button>
            </div>
            <form onSubmit={handleCheckoutSubmit} className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 24px', overflowY: 'auto' }}>
              <p style={{ color: 'var(--dim)', fontSize: '0.85rem', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                Confirm shipping coordinates for the transaction.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="foot-label">Recipient Name</label>
                <div className="notify-box" style={{ maxWidth: '100%', borderRadius: '12px' }}>
                  <input type="text" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} placeholder="Akash" required style={{ padding: '10px 14px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="foot-label">Coordinates Address</label>
                <textarea
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  placeholder="Enter your full shipping address..."
                  required
                  style={{ background: 'var(--ink)', border: '1px solid var(--hair2)', borderRadius: '12px', color: 'var(--bone)', padding: '12px', fontFamily: 'var(--body)', fontSize: '0.85rem', height: '80px', resize: 'none', outline: 'none' }}
                />
              </div>

              <button className="checkout" type="submit" style={{ marginTop: '10px' }}>Proceed to Payment</button>
            </form>
          </>
        ) : (
          <>
            <div className="cart-head">
              <h3 style={{ fontFamily: 'var(--disp)', textTransform: 'uppercase' }}>Payment</h3>
              <button className="cart-close" onClick={() => setCheckoutStep('shipping')}>&larr;</button>
            </div>
            <div className="cart-items" style={{ padding: '20px 24px', overflowY: 'auto' }}>
              {isMockPayment ? (
                <MockPaymentForm
                  total={checkoutTotal}
                  shippingName={checkoutName}
                  onBack={() => setCheckoutStep('shipping')}
                  onSuccess={() => {
                    setCart([]);
                    updateLocalStorage([]);
                    setCheckoutStep('cart');
                    setCartOpen(false);
                    fly('Payment received successfully. Order initialized.');
                    fetchOrders();
                    setAuthMode('profile');
                    setTimeout(() => setAuthOpen(true), 1200);
                  }}
                />
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <RealStripeForm
                    clientSecret={clientSecret}
                    orderId={checkoutOrderId}
                    total={checkoutTotal}
                    shippingName={checkoutName}
                    onBack={() => setCheckoutStep('shipping')}
                    onSuccess={() => {
                      setCart([]);
                      updateLocalStorage([]);
                      setCheckoutStep('cart');
                      setCartOpen(false);
                      fly('Payment received successfully. Order initialized.');
                      fetchOrders();
                      setAuthMode('profile');
                      setTimeout(() => setAuthOpen(true), 1200);
                    }}
                  />
                </Elements>
              )}
            </div>
          </>
        )}
      </aside>

      {/* USER AUTH DRAWER */}
      <aside className={`cart ${authOpen ? 'open' : ''}`} style={{ zIndex: 190 }}>
        <div className="cart-head">
          <h3 style={{ fontFamily: 'var(--disp)', fontWeight: 400, fontSize: '1.3rem', textTransform: 'uppercase' }}>
            {authMode === 'profile' ? 'Marked Lineage' : 'Wear The Mark'}
          </h3>
          <button className="cart-close" onClick={() => setAuthOpen(false)}>&times;</button>
        </div>

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px 24px' }}>
            <p style={{ color: 'var(--dim)', fontSize: '0.85rem', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
              Access your marked lineage. View past orders and manage shipping details.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="foot-label">Email</label>
              <div className="notify-box" style={{ width: '100%', maxWidth: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                <input type="email" placeholder="your@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required style={{ padding: '10px 14px', flex: 1, width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="foot-label">Password</label>
              <div className="notify-box" style={{ width: '100%', maxWidth: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                <input type={showLoginPassword ? 'text' : 'password'} placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required style={{ padding: '10px 14px', flex: 1, width: '100%' }} />
                <div
                  role="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{ cursor: 'pointer', color: 'var(--dim)', paddingRight: '14px', display: 'flex', alignItems: 'center', height: '100%', userSelect: 'none' }}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? (
                    <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            <button className="checkout" type="submit" style={{ marginTop: '10px' }}>Authorize Session</button>
            <p style={{ fontSize: '0.75rem', color: 'var(--dim2)', textAlign: 'center' }}>
              New user?{' '}
              <a onClick={() => setAuthMode('register')} style={{ color: 'var(--bone)', textDecoration: 'underline', cursor: 'pointer' }}>
                Register here
              </a>
            </p>
          </form>
        ) : authMode === 'register' ? (
          <form onSubmit={handleRegister} className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px 24px' }}>
            <p style={{ color: 'var(--dim)', fontSize: '0.85rem', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
              Initiate your profile coordinates to track shipments and order drops.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="foot-label">Full Name</label>
              <div className="notify-box" style={{ width: '100%', maxWidth: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                <input type="text" placeholder="Initiate Name" value={regName} onChange={(e) => setRegName(e.target.value)} required style={{ padding: '10px 14px', flex: 1, width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="foot-label">Email</label>
              <div className="notify-box" style={{ width: '100%', maxWidth: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                <input type="email" placeholder="your@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required style={{ padding: '10px 14px', flex: 1, width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="foot-label">Password</label>
              <div className="notify-box" style={{ width: '100%', maxWidth: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                <input type={showRegPassword ? 'text' : 'password'} placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required style={{ padding: '10px 14px', flex: 1, width: '100%' }} />
                <div
                  role="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={{ cursor: 'pointer', color: 'var(--dim)', paddingRight: '14px', display: 'flex', alignItems: 'center', height: '100%', userSelect: 'none' }}
                  aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegPassword ? (
                    <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            <button className="checkout" type="submit" style={{ marginTop: '10px' }}>Register Profile</button>
            <p style={{ fontSize: '0.75rem', color: 'var(--dim2)', textAlign: 'center' }}>
              Already registered?{' '}
              <a onClick={() => setAuthMode('login')} style={{ color: 'var(--bone)', textDecoration: 'underline', cursor: 'pointer' }}>
                Sign in here
              </a>
            </p>
          </form>
        ) : (
          user && (
            <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px 24px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="foot-label">Initiate Name</span>
                <b style={{ fontSize: '1.25rem', color: 'var(--bone)' }}>{user.name}</b>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="foot-label">Email Node</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--dim)' }}>{user.email}</span>
              </div>

              {/* SETTINGS ACCORDION PANEL */}
              <div>
                <button className="foot-chip" onClick={() => setSettingsOpen(!settingsOpen)} style={{ padding: '0 12px', fontSize: '0.62rem', height: '28px', background: 'rgba(236,232,225,0.03)' }}>
                  {settingsOpen ? 'Collapse Settings' : 'Edit Profile Settings'}
                </button>
                {settingsOpen && (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--hair2)', paddingTop: '16px' }}>
                    <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label className="foot-label" style={{ fontSize: '0.5rem', color: 'var(--dim2)' }}>Full Name</label>
                        <div className="notify-box" style={{ maxWidth: '100%', borderRadius: '8px' }}>
                          <input type="text" value={updateName} onChange={(e) => setUpdateName(e.target.value)} required style={{ padding: '6px 10px', fontSize: '0.75rem' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label className="foot-label" style={{ fontSize: '0.5rem', color: 'var(--dim2)' }}>Shipping Coordinates</label>
                        <textarea
                          value={updateAddress}
                          onChange={(e) => setUpdateAddress(e.target.value)}
                          placeholder="No address registered"
                          style={{ background: 'var(--ink)', border: '1px solid var(--hair2)', borderRadius: '8px', color: 'var(--bone)', padding: '8px', fontSize: '0.75rem', height: '60px', resize: 'none', outline: 'none' }}
                        />
                      </div>
                      <button className="foot-chip" type="submit" style={{ height: '30px', padding: '0 12px', fontSize: '0.6rem', alignSelf: 'flex-start' }}>Update Profile</button>
                    </form>

                    <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--hair)', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label className="foot-label" style={{ fontSize: '0.5rem', color: 'var(--dim2)' }}>Current Password</label>
                        <div className="notify-box" style={{ maxWidth: '100%', borderRadius: '8px' }}>
                          <input type="password" value={updateCurrentPassword} onChange={(e) => setUpdateCurrentPassword(e.target.value)} placeholder="••••••••" style={{ padding: '6px 10px', fontSize: '0.75rem' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label className="foot-label" style={{ fontSize: '0.5rem', color: 'var(--dim2)' }}>New Password</label>
                        <div className="notify-box" style={{ maxWidth: '100%', borderRadius: '8px' }}>
                          <input type="password" value={updateNewPassword} onChange={(e) => setUpdateNewPassword(e.target.value)} placeholder="••••••••" style={{ padding: '6px 10px', fontSize: '0.75rem' }} />
                        </div>
                      </div>
                      <button className="foot-chip" type="submit" style={{ height: '30px', padding: '0 12px', fontSize: '0.6rem', alignSelf: 'flex-start' }}>Change Password</button>
                    </form>
                  </div>
                )}
              </div>

              {/* PAST ORDERS LIST */}
              <div style={{ marginTop: '10px', borderTop: '1px solid var(--hair2)', paddingTop: '20px' }}>
                <h5 className="foot-label" style={{ marginBottom: '10px' }}>Marked Lineage (Orders)</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', fontSize: '0.8rem', color: 'var(--dim)' }}>
                  {userOrders.map(order => (
                    <div key={order.id} style={{ background: 'rgba(236,232,225,0.03)', border: '1px solid var(--hair)', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--bone)' }}>{order.id}</span>
                        <span className={`tag ${order.status === 'paid' ? 'red' : ''}`} style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{order.status}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--dim2)' }}>Total: ₹{order.total.toLocaleString('en-IN')}</div>
                      <button className="icon-btn" onClick={() => { setTrackingOrderId(order.id); setTrackingOpen(true); setAuthOpen(false); }} style={{ fontSize: '0.62rem', color: 'var(--red)', alignSelf: 'flex-start', padding: 0, marginTop: '4px' }}>
                        Track Progress &rarr;
                      </button>
                    </div>
                  ))}
                  {userOrders.length === 0 && <p style={{ fontStyle: 'italic', fontFamily: 'var(--serif)' }}>No marks retrieved yet.</p>}
                </div>
              </div>

              <button className="add" onClick={handleLogout} style={{ marginTop: 'auto', background: 'var(--red)', color: '#fff', border: 0 }}>Logout</button>
            </div>
          )
        )}
      </aside>

      {/* ADMIN CONSOLE DRAWER */}
      <aside className={`cart ${adminOpen ? 'open' : ''}`} style={{ maxWidth: '600px', width: '100%', borderLeft: '1px solid var(--hair2)', zIndex: 190 }}>
        <div className="cart-head">
          <h3 style={{ fontFamily: 'var(--disp)', fontWeight: 400, fontSize: '1.3rem', textTransform: 'uppercase' }}>Admin Console</h3>
          <button className="cart-close" onClick={() => setAdminOpen(false)}>&times;</button>
        </div>

        {/* Loading skeleton while stats are being fetched */}
        {!adminStats && adminOpen && (
          <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: '72px', background: 'rgba(236,232,225,0.04)', border: '1px solid var(--hair)', borderRadius: '12px', animation: 'pulse 1.6s ease-in-out infinite' }} />
            ))}
            <p style={{ textAlign: 'center', color: 'var(--dim)', fontSize: '0.75rem', fontFamily: 'var(--serif)', fontStyle: 'italic', marginTop: '8px' }}>Loading analytics…</p>
          </div>
        )}

        {adminStats && (() => {
          const lowStockCount = adminStats.products.filter((p: any) => p.stock < 15).length;
          const aov = Math.round(adminStats.totalSales / (adminStats.totalOrders || 1));
          
          // Calculate daily sales trend data
          const salesMap: Record<string, { count: number; total: number }> = {};
          const daysToTrend = 7;
          for (let i = daysToTrend - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            salesMap[label] = { count: 0, total: 0 };
          }
          
          adminStats.orders.forEach((o: any) => {
            if (!o.created_at) return;
            const cleanStr = o.created_at.endsWith('Z') ? o.created_at : o.created_at + ' UTC';
            const date = new Date(cleanStr);
            const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            if (salesMap[label] !== undefined) {
              salesMap[label].count++;
              salesMap[label].total += o.total;
            }
          });
          
          const trendData = Object.entries(salesMap).map(([date, data]) => ({
            date,
            total: data.total
          }));

          const maxTrendSales = Math.max(...trendData.map(t => t.total), 2000);
          
          // SVG points calculation
          const svgW = 500;
          const svgH = 120;
          const paddingLeft = 46;
          const paddingRight = 16;
          const chartW = svgW - paddingLeft - paddingRight;
          const chartH = svgH - 24;
          
          const points = trendData.map((d, i) => {
            const x = paddingLeft + (i * chartW) / (daysToTrend - 1);
            const y = chartH - (d.total * (chartH - 12)) / maxTrendSales;
            return { x, y, val: d.total, date: d.date };
          });
          
          const linePathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
          const areaPathD = points.length > 0 ? `${linePathD} L ${points[points.length - 1].x} ${chartH} L ${points[0].x} ${chartH} Z` : '';
          
          const topProducts = (adminStats.salesByProduct || []).slice(0, 3);
          const maxTpQty = Math.max(...topProducts.map((p: any) => p.totalQty), 1);

          return (
            <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px 24px', overflowY: 'auto' }}>
              
              {/* Stat Widgets 2x2 Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'rgba(236,232,225,.03)', border: '1px solid var(--hair2)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: 'var(--dim2)', letterSpacing: '0.05em' }}>Total Revenue</span>
                  <b style={{ fontSize: '1.25rem', color: 'var(--bone)', fontFamily: 'var(--disp)' }}>₹{adminStats.totalSales.toLocaleString('en-IN')}</b>
                </div>
                <div style={{ background: 'rgba(236,232,225,.03)', border: '1px solid var(--hair2)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: 'var(--dim2)', letterSpacing: '0.05em' }}>Total Initiations</span>
                  <b style={{ fontSize: '1.25rem', color: 'var(--bone)', fontFamily: 'var(--disp)' }}>{adminStats.totalOrders}</b>
                </div>
                <div style={{ background: 'rgba(236,232,225,.03)', border: '1px solid var(--hair2)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: 'var(--dim2)', letterSpacing: '0.05em' }}>Average Order Value</span>
                  <b style={{ fontSize: '1.25rem', color: 'var(--bone)', fontFamily: 'var(--disp)' }}>₹{aov.toLocaleString('en-IN')}</b>
                </div>
                <div style={{ background: 'rgba(236,232,225,.03)', border: '1px solid var(--hair2)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: 'var(--dim2)', letterSpacing: '0.05em' }}>Low Stock Alerts</span>
                  <b style={{ fontSize: '1.25rem', color: lowStockCount > 0 ? 'var(--red)' : 'var(--bone)', fontFamily: 'var(--disp)' }}>{lowStockCount} items</b>
                </div>
              </div>

              {/* Sales Trend SVG Line Graph */}
              <div>
                <h5 className="foot-label" style={{ marginBottom: '12px', borderBottom: '1px solid var(--hair2)', paddingBottom: '8px' }}>Sales Analytics (Last 7 Days)</h5>
                <div style={{ background: 'rgba(236,232,225,0.01)', border: '1px solid var(--hair2)', borderRadius: '16px', padding: '16px 12px 8px 12px' }}>
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="chartLineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--red)" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="var(--red)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Horizontal Scale Lines */}
                    {[0, 0.5, 1].map((ratio, gridIdx) => {
                      const gridY = chartH - ratio * (chartH - 12);
                      const scaleVal = Math.round(ratio * maxTrendSales);
                      return (
                        <g key={gridIdx}>
                          <line x1={paddingLeft} y1={gridY} x2={svgW - paddingRight} y2={gridY} stroke="var(--hair)" strokeWidth="1" strokeDasharray="3,3" />
                          <text x={paddingLeft - 8} y={gridY + 3} fill="var(--dim2)" fontSize="9" fontFamily="monospace" textAnchor="end">₹{scaleVal}</text>
                        </g>
                      );
                    })}
                    
                    {/* Area Fill */}
                    {areaPathD && <path d={areaPathD} fill="url(#chartLineGrad)" />}
                    
                    {/* Glowing Stroke Path */}
                    {linePathD && (
                      <path
                        d={linePathD}
                        fill="none"
                        stroke="var(--red)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: 'drop-shadow(0 0 5px rgba(225,6,0,0.5))' }}
                      />
                    )}
                    
                    {/* Data Circles & Tooltip Values */}
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="3" fill="#fff" stroke="var(--red)" strokeWidth="2.5" />
                        <text x={p.x} y={p.y - 8} fill="var(--bone)" fontSize="8" fontFamily="monospace" textAnchor="middle">
                          {p.val > 0 ? `₹${Math.round(p.val / 1000)}k` : ''}
                        </text>
                        {/* Day label */}
                        <text x={p.x} y={svgH - 4} fill="var(--dim2)" fontSize="8" textAnchor="middle">
                          {p.date.split(' ')[0]}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Top Selling Products Share Progress Bars */}
              {topProducts.length > 0 && (
                <div>
                  <h5 className="foot-label" style={{ marginBottom: '12px', borderBottom: '1px solid var(--hair2)', paddingBottom: '8px' }}>Top Selling Products</h5>
                  <div style={{ background: 'rgba(236,232,225,0.02)', border: '1px solid var(--hair2)', borderRadius: '16px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {topProducts.map((tp: any) => {
                      const percent = Math.min((tp.totalQty / maxTpQty) * 100, 100);
                      return (
                        <div key={tp.productId} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--bone)', fontSize: '0.8rem', fontWeight: 500 }}>{tp.name}</span>
                            <span style={{ color: 'var(--red)', fontSize: '0.74rem', fontWeight: 600, fontFamily: 'monospace' }}>
                              {tp.totalQty} units &middot; ₹{tp.totalRevenue.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'var(--coal)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(to right, var(--red), #ff6a5e)', borderRadius: '3px', boxShadow: '0 0 6px var(--red)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Inventory Restock Console */}
              <div>
                <h5 className="foot-label" style={{ marginBottom: '12px', borderBottom: '1px solid var(--hair2)', paddingBottom: '8px' }}>Inventory Restock Console</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {adminStats.products.map((p: any) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(236,232,225,0.03)', border: '1px solid var(--hair)', borderRadius: '8px', padding: '10px 14px' }}>
                      <div>
                        <span style={{ fontFamily: 'monospace', color: 'var(--red)', fontSize: '0.75rem', marginRight: '6px' }}>[{p.id}]</span>
                        <span style={{ color: 'var(--bone)', fontSize: '0.85rem' }}>{p.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: p.stock < 10 ? 'var(--red)' : 'var(--dim)' }}>Stock: <b>{p.stock}</b></span>
                        <button className="foot-chip" onClick={() => handleAdminRestock(p.id, p.stock)} style={{ height: '24px', padding: '0 8px', fontSize: '0.55rem' }}>Restock</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status Override */}
              <div>
                <h5 className="foot-label" style={{ marginBottom: '12px', borderBottom: '1px solid var(--hair2)', paddingBottom: '8px' }}>Order Status Override</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                  {adminStats.orders.map((o: any) => (
                    <div key={o.id} style={{ background: 'rgba(236,232,225,0.03)', border: '1px solid var(--hair)', borderRadius: '8px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--bone)' }}>{o.id}</span>
                        <span className="tag red" style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px' }}>{o.status}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>Recipient: {o.shipping_name} &middot; Total: ₹{o.total.toLocaleString('en-IN')}</div>
                      <button className="foot-chip" onClick={() => handleAdminUpdateStatus(o.id)} style={{ height: '24px', padding: '0 8px', fontSize: '0.55rem', alignSelf: 'flex-start' }}>Change Status</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })()}
        <div className="cart-foot" style={{ background: 'var(--coal2)' }}>
          <div className="cart-note" style={{ fontSize: '0.6rem' }}>Admin Mode &middot; Read/Write SQLite Access Enabled</div>
        </div>
      </aside>

      {/* ORDER TRACKING PORTAL DRAWER */}
      <aside className={`cart ${trackingOpen ? 'open' : ''}`} style={{ zIndex: 190 }}>
        <div className="cart-head">
          <h3 style={{ fontFamily: 'var(--disp)', textTransform: 'uppercase' }}>Track Order</h3>
          <button className="cart-close" onClick={() => { setTrackingOpen(false); setTrackingOrderData(null); }}>&times;</button>
        </div>
        
        <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px 24px', overflowY: 'auto' }}>
          <form onSubmit={handleTrackingSearch} className="notify-box" style={{ maxWidth: '100%', borderRadius: '12px' }}>
            <input
              type="text"
              placeholder="Enter Order ID (AURA-XXXX...)"
              value={trackingOrderId}
              onChange={(e) => setTrackingOrderId(e.target.value)}
              required
              style={{ padding: '10px 14px' }}
            />
            <button type="submit" style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--bone)', paddingRight: '14px', fontSize: '0.8rem' }}>Track</button>
          </form>

          {trackingOrderData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '10px' }}>
              <div style={{ background: 'rgba(236,232,225,0.03)', border: '1px solid var(--hair2)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="foot-label">Manifest Status</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleTrackingSearch({ preventDefault: () => {} } as any)}
                      className="refresh-btn"
                      style={{
                        background: 'none',
                        border: 0,
                        cursor: 'pointer',
                        color: 'var(--dim2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                      aria-label="Refresh status"
                    >
                      <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
                        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                      </svg>
                    </button>
                    <span className={`tag ${trackingOrderData.status === 'paid' || trackingOrderData.status === 'delivered' ? 'red' : ''}`} style={{ fontSize: '0.65rem', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px' }}>
                      {trackingOrderData.status}
                    </span>
                  </div>
                </div>
                
                {/* Simulated Shipment Flow Steps */}
                {(() => {
                  const statuses = ['paid', 'shipped', 'out_for_delivery', 'delivered'];
                  const currentIdx = statuses.indexOf(trackingOrderData.status);
                  const progressPercent = currentIdx === 0 ? 10 : currentIdx === 1 ? 40 : currentIdx === 2 ? 70 : 100;
                  
                  const stepDetails = [
                    {
                      key: 'paid',
                      title: 'Order Placed & Verified',
                      desc: 'Manifest processed and payment captured successfully.',
                      offset: 0,
                      icon: (
                        <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      )
                    },
                    {
                      key: 'shipped',
                      title: 'Dispatched from Hub',
                      desc: 'Package handed over to routing logistics carrier.',
                      offset: 30,
                      icon: (
                        <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
                          <rect x="1" y="3" width="15" height="13" />
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                          <circle cx="5.5" cy="18.5" r="2.5" />
                          <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                      )
                    },
                    {
                      key: 'out_for_delivery',
                      title: 'Out for Delivery',
                      desc: 'Carrier agent routing to your shipping coordinates.',
                      offset: 90,
                      icon: (
                        <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      )
                    },
                    {
                      key: 'delivered',
                      title: 'Delivered',
                      desc: 'Package successfully placed and signed at destination.',
                      offset: 180,
                      icon: (
                        <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
                          <polyline points="22 11.08 22 12 12 22 4 14 6.5 11.5 12 17 20.3 8.7" />
                          <path d="M21 12A9 9 0 1 1 15.9 4.14" />
                        </svg>
                      )
                    }
                  ];

                  const getSimulatedStepTime = (createdAtStr: string, secondsOffset: number) => {
                    const cleanStr = createdAtStr.endsWith('Z') ? createdAtStr : createdAtStr + ' UTC';
                    const baseTime = new Date(cleanStr).getTime();
                    const targetTime = baseTime + (secondsOffset * 1000);
                    if (Date.now() >= targetTime) {
                      return new Date(targetTime).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      });
                    }
                    return null;
                  };

                  const getEstimatedTime = (createdAtStr: string, secondsOffset: number) => {
                    const cleanStr = createdAtStr.endsWith('Z') ? createdAtStr : createdAtStr + ' UTC';
                    const baseTime = new Date(cleanStr).getTime();
                    const targetTime = baseTime + (secondsOffset * 1000);
                    const diffSec = Math.ceil((targetTime - Date.now()) / 1000);
                    if (diffSec <= 0) return null;
                    if (diffSec < 60) return `Estimated in ${diffSec}s`;
                    return `Estimated in ${Math.ceil(diffSec / 60)}m`;
                  };

                  return (
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '30px', paddingLeft: '24px', borderLeft: '2px solid var(--hair2)', margin: '15px 0 10px 12px' }}>
                      {/* Progress line overlay */}
                      <div style={{
                        position: 'absolute',
                        left: '-2px',
                        top: 0,
                        width: '2px',
                        background: 'linear-gradient(to bottom, var(--red), #ff6a5e)',
                        height: `${progressPercent}%`,
                        boxShadow: '0 0 12px var(--red)',
                        transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                      }} />
                      
                      {stepDetails.map((step, idx) => {
                        const done = currentIdx >= idx;
                        const completedTime = getSimulatedStepTime(trackingOrderData.created_at, step.offset);
                        const estTime = getEstimatedTime(trackingOrderData.created_at, step.offset);

                        return (
                          <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                            {/* Step Badge Pin */}
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: done ? 'var(--red)' : 'var(--coal)',
                              border: `1px solid ${done ? 'var(--red)' : 'var(--hair2)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: done ? '#fff' : 'var(--dim2)',
                              position: 'absolute',
                              left: '-39px',
                              top: '0px',
                              boxShadow: done ? '0 0 10px rgba(225,6,0,0.35)' : 'none',
                              zIndex: 2,
                              transition: 'all 0.3s ease'
                            }}>
                              {step.icon}
                            </div>
                            
                            {/* Details */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{
                                fontSize: '0.78rem',
                                color: done ? 'var(--bone)' : 'var(--dim)',
                                fontWeight: done ? 600 : 400
                              }}>
                                {step.title}
                              </span>
                              <span style={{ fontSize: '0.66rem', color: done ? 'var(--dim)' : 'var(--dim2)', lineHeight: 1.3 }}>
                                {step.desc}
                              </span>
                              {completedTime ? (
                                <span style={{ fontSize: '0.6rem', color: 'var(--red)', marginTop: '2px', fontFamily: 'monospace' }}>
                                  {completedTime}
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.6rem', color: 'var(--dim2)', marginTop: '2px', fontStyle: 'italic' }}>
                                  {estTime || 'Estimated: pending preceding step'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div>
                <h5 className="foot-label" style={{ marginBottom: '10px' }}>Items Initiated</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {trackingOrderData.items.map(item => (
                    <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(236,232,225,0.02)', border: '1px solid var(--hair)', borderRadius: '8px', padding: '10px 14px' }}>
                      <div>
                        <b style={{ color: 'var(--bone)', fontSize: '0.85rem' }}>{item.name}</b>
                        <div style={{ fontSize: '0.7rem', color: 'var(--dim2)' }}>Size: {item.size} &middot; Qty: {item.quantity}</div>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--bone)', fontFamily: 'var(--disp)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--dim2)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
              Enter an order ID to view manifest routing details.
            </p>
          )}
        </div>
      </aside>

      {/* WISHLIST SIDE DRAWER */}
      <aside className={`cart ${wishlistOpen ? 'open' : ''}`} style={{ zIndex: 190 }}>
        <div className="cart-head">
          <h3 style={{ fontFamily: 'var(--disp)', textTransform: 'uppercase' }}>Your Wishlist</h3>
          <button className="cart-close" onClick={() => setWishlistOpen(false)}>&times;</button>
        </div>
        
        <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px 24px', overflowY: 'auto' }}>
          {wishlistItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {wishlistItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '14px', background: 'rgba(236,232,225,0.03)', border: '1px solid var(--hair)', borderRadius: '12px', padding: '12px 16px', alignItems: 'center' }}>
                  {/* Miniature Spin Garment SVG icon */}
                  <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--coal)', borderRadius: '8px', border: '1px solid var(--hair2)', flexShrink: 0 }}>
                    <div style={{ width: '36px', height: '36px', transform: 'scale(0.85)' }} dangerouslySetInnerHTML={{ __html: SVGS[item.art] }}></div>
                  </div>
                  
                  {/* Name and Price */}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '2px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--bone)', fontWeight: 500 }}>{item.name}</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--dim)' }}>₹{item.price.toLocaleString('en-IN')}</span>
                  </div>
                  
                  {/* Action Buttons (Add to Cart, Delete) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      className="foot-chip"
                      onClick={() => {
                        addToCart(item, 'M');
                      }}
                      style={{ height: '26px', padding: '0 10px', fontSize: '0.6rem' }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--dim2)', padding: '4px' }}
                      aria-label="Remove item"
                    >
                      <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', marginTop: '40px' }}>
              <svg viewBox="0 0 24 24" style={{ width: '36px', height: '36px', fill: 'none', stroke: 'var(--dim2)', strokeWidth: 1.5 }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <p style={{ color: 'var(--dim2)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center' }}>
                Your wishlist is empty. Bookmark your favorites from the drop.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* PRODUCT DETAILS VIEW MODAL */}
      {detailProduct && (
        <div className="pdetail-modal open" id="pdetailModal">
          <div className="pdetail-overlay" onClick={() => setDetailProduct(null)}></div>
          <div className="pdetail-content">
            <button className="pdetail-close" onClick={() => setDetailProduct(null)} aria-label="Close product details">&times;</button>
            <div className="pdetail-grid">
              <div className="pdetail-media">
                <div className="fig" style={{ width: '220px', aspectRatio: '200/220', position: 'relative' }}>
                  <div className="shadow" style={{ transform: 'translateX(-50%) scale(1.3)', opacity: 0.45, bottom: '-6px' }}></div>
                  <div className="lift" style={{ transform: 'translateY(-20px) scale(1.15)' }}>
                    <div className="spin" dangerouslySetInnerHTML={{ __html: SVGS[detailProduct.art] }}></div>
                  </div>
                </div>
              </div>
              <div className="pdetail-body">
                <span className="pdetail-cat">{detailProduct.catLabel}</span>
                <h2>{detailProduct.name}</h2>
                <div className="pdetail-price">₹{detailProduct.price.toLocaleString('en-IN')}</div>
                <p className="pdetail-desc">{detailProduct.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                  <span className="foot-label">Select Size</span>
                  <div className="pdetail-sizes">
                    {(detailProduct.cat === 'headwear' ? ['OS'] : ['S', 'M', 'L', 'XL']).map(s => (
                      <button key={s} className={`size ${s === detailSize ? 'sel' : ''}`} onClick={() => setDetailSize(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="pdetail-add-btn" type="button" onClick={() => {
                  addToCart(detailProduct, detailSize);
                  setDetailProduct(null);
                  setCheckoutStep('cart');
                  setCartOpen(true);
                }}>
                  <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                  Add to Cart
                </button>

                {/* HANDPICKED SUBTEXT */}
                <div style={{
                  fontSize: '0.62rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.08em',
                  color: 'var(--dim2)',
                  marginTop: '16px',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  opacity: 0.8
                }}>
                  HANDPICKED STYLES | ASSURED QUALITY
                </div>

                {/* SAVE TO WISHLIST BUTTON */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(detailProduct.id)}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    height: '36px',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: wishlistItems.some(item => item.id === detailProduct.id) ? 'rgba(225,6,0,0.08)' : 'transparent',
                    border: wishlistItems.some(item => item.id === detailProduct.id) ? '1px solid var(--red)' : '1px solid var(--hair2)',
                    color: wishlistItems.some(item => item.id === detailProduct.id) ? 'var(--red)' : 'var(--bone)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  className="modal-wishlist-btn"
                >
                  <svg viewBox="0 0 24 24" style={{ width: '13px', height: '13px', fill: wishlistItems.some(item => item.id === detailProduct.id) ? 'currentColor' : 'none', stroke: 'currentColor', strokeWidth: 2 }}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {wishlistItems.some(item => item.id === detailProduct.id) ? 'Remove From Wishlist' : 'Save to Wishlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST ALERT */}
      <div id="toast" className={toastShow ? 'show' : ''}>
        <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
        <span id="toastMsg">{toastMessage}</span>
      </div>
    </>
  );
}
export const dynamic = 'force-dynamic';
