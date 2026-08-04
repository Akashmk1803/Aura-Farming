'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Customers', path: '/admin/customers' },
    { name: 'Coupons', path: '/admin/coupons' },
    { name: 'Analytics', path: '/admin/analytics' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
        }
      }
    });
  };

  return (
    <aside style={{ width: '260px', background: 'var(--coal)', borderRight: '1px solid var(--hair)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .admin-nav-item {
          border: 1px solid transparent;
        }
        .admin-nav-item:hover {
          background: rgba(225, 6, 0, 0.08) !important;
          border-color: rgba(225, 6, 0, 0.4) !important;
          box-shadow: 0 0 12px rgba(225, 6, 0, 0.2);
          color: var(--bone) !important;
        }
        .admin-action-btn:hover {
          background: rgba(225, 6, 0, 0.08) !important;
          border-color: rgba(225, 6, 0, 0.4) !important;
          box-shadow: 0 0 12px rgba(225, 6, 0, 0.2);
          filter: brightness(1.1);
          color: var(--bone) !important;
        }
      `}</style>
      <div style={{ borderBottom: '1px solid var(--hair)' }}>
        <Link href="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', textDecoration: 'none', justifySelf: 'auto' }}>
          <img src="data:image/png;base64,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" alt="Aura Farming Logo" />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontFamily: 'var(--disp)', fontSize: '1.5rem', color: 'var(--bone)', letterSpacing: '0.05em', margin: 0, lineHeight: 1 }}>AURA ADMIN</h2>
            <div style={{ color: 'var(--dim)', fontSize: '0.8rem', marginTop: '4px', lineHeight: 1.2 }}>Welcome, {user?.name || 'Admin'}</div>
          </div>
        </Link>
      </div>
      
      <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.name} 
              className="admin-nav-item" 
              href={item.path}
              style={{
                display: 'block',
                padding: '12px 16px',
                borderRadius: '8px',
                color: isActive ? 'var(--bone)' : 'var(--dim)',
                background: isActive ? 'var(--hair)' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.95rem',
                transition: 'all 0.25s ease'
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '24px 16px', borderTop: '1px solid var(--hair)' }}>
        <Link 
          href="/"
          className="admin-action-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '12px 16px',
            marginBottom: '12px',
            background: 'transparent',
            border: '1px solid var(--hair2)',
            borderRadius: '8px',
            color: 'var(--bone)',
            cursor: 'pointer',
            fontFamily: 'var(--body)',
            fontWeight: 600,
            fontSize: '0.95rem',
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'all 0.25s ease'
          }}
        >
          <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          View Store
        </Link>
        <button 
          onClick={handleLogout}
          className="admin-action-btn"
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'transparent',
            border: '1px solid var(--hair2)',
            borderRadius: '8px',
            color: 'var(--bone)',
            cursor: 'pointer',
            fontFamily: 'var(--body)',
            fontWeight: 600,
            fontSize: '0.95rem',
            textAlign: 'center',
            transition: 'all 0.25s ease'
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
