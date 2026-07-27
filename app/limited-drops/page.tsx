"use client";

export default function LimitedDropsPage() {
  return (
    <>
      {/* Grain overlay — matches main storefront */}
      <div id="grain" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
        backgroundSize: '256px 256px',
      }} />

      <main style={{
        minHeight: '100vh',
        background: 'var(--coal, #0c0c0e)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        fontFamily: '"Inter Tight", sans-serif',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
      }}>

        {/* Back to top nav */}
        <a href="/" style={{
          position: 'absolute', top: '28px', left: '28px',
          display: 'flex', alignItems: 'center', gap: '8px',
          color: 'rgba(236,232,225,0.35)', textDecoration: 'none',
          fontFamily: '"Anton", sans-serif', fontSize: '0.65rem',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ece8e1')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(236,232,225,0.35)')}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </a>

        {/* Lock icon */}
        <div style={{ marginBottom: '36px' }}>
          <svg viewBox="0 0 64 64" width="54" height="54" fill="none" stroke="#e10600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="14" y="30" width="36" height="26" rx="5" />
            <path d="M22 30 Q22 14 32 14 Q42 14 42 30" />
            <circle cx="32" cy="43" r="3.5" fill="#e10600" stroke="none" />
            <line x1="32" y1="46" x2="32" y2="51" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Eyebrow */}
        <p style={{
          fontFamily: '"Anton", sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#e10600',
          marginBottom: '18px',
        }}>
          Limited Archive
        </p>

        {/* Heading */}
        <h1 style={{
          fontFamily: '"Anton", sans-serif',
          fontSize: 'clamp(2rem, 8vw, 4.5rem)',
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          color: '#ece8e1',
          margin: '0 0 20px',
          maxWidth: '680px',
        }}>
          More Limited<br />
          <span style={{ color: '#e10600' }}>Drops</span> Coming
        </h1>

        {/* Divider */}
        <div style={{
          width: '48px', height: '2px',
          background: 'linear-gradient(90deg, transparent, #e10600, transparent)',
          margin: '0 auto 28px',
        }} />

        {/* Subtext */}
        <p style={{
          fontFamily: '"EB Garamond", serif',
          fontSize: '1rem',
          fontStyle: 'italic',
          color: 'rgba(236,232,225,0.4)',
          maxWidth: '420px',
          lineHeight: 1.7,
          margin: '0 0 48px',
        }}>
          The archive expands in silence. Each drop is scarce, unrepeated, and
          permanent. Check back — or carry the mark until the next one surfaces.
        </p>

        {/* CTA back to store */}
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 32px',
            background: 'transparent',
            border: '1px solid rgba(225,6,0,0.5)',
            borderRadius: '6px',
            color: '#e10600',
            fontFamily: '"Anton", sans-serif',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'background 0.2s, border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#e10600';
            e.currentTarget.style.color = '#0c0c0e';
            e.currentTarget.style.borderColor = '#e10600';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#e10600';
            e.currentTarget.style.borderColor = 'rgba(225,6,0,0.5)';
          }}
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Return to Storefront
        </a>

        {/* Footer mark */}
        <p style={{
          position: 'absolute',
          bottom: '24px',
          fontFamily: '"Anton", sans-serif',
          fontSize: '0.5rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'rgba(236,232,225,0.12)',
        }}>
          Aura Farming — wear the mark
        </p>
      </main>

      {/* Load fonts to match main site */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter+Tight:wght@300;400;500&family=EB+Garamond:ital@0;1&display=swap');

        :root {
          --coal: #0c0c0e;
          --red: #e10600;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0c0c0e; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </>
  );
}
