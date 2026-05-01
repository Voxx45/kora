'use client'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section
      style={{
        minHeight: '94vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      {/* Dot grid */}
      <svg
        aria-hidden
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
      >
        <defs>
          <pattern id="hero-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="rgba(0,0,0,0.055)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
      </svg>

      {/* Radial fade over dots */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse 65% 80% at 28% 50%, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.75) 55%, rgba(255,255,255,0.1) 100%)',
      }} />

      {/* Blue glow top-right */}
      <div style={{
        position: 'absolute', top: '-180px', right: '-80px',
        width: '540px', height: '540px', borderRadius: '50%', zIndex: 1,
        background: 'radial-gradient(circle, rgba(0,122,255,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div
        className="hero-grid"
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%',
          padding: '80px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 460px',
          gap: '56px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* ── Left: Copy ── */}
        <div style={{ animation: 'kora-fade-up 0.6s ease both' }}>
          {/* Available badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '5px 12px 5px 8px',
              borderRadius: '100px',
              border: '1px solid rgba(48,209,88,0.3)',
              background: 'rgba(48,209,88,0.07)',
            }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: '#30D158', display: 'block',
                animation: 'kora-pulse-dot 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#1a7a40', letterSpacing: '0.3px' }}>
                Disponible pour de nouveaux projets
              </span>
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(44px, 5.8vw, 72px)',
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: '-3.5px',
            color: '#1C1C1E',
            marginBottom: '24px',
          }}>
            On amplifie<br />
            <span style={{
              fontWeight: 200,
              letterSpacing: '-2.5px',
              background: 'linear-gradient(90deg, #1C1C1E 0%, #8E8E93 45%, #1C1C1E 90%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'kora-shimmer 5s linear infinite',
            }}>
              votre présence
            </span>
            <br />en ligne.
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: '15px', lineHeight: 1.75,
            color: '#8E8E93', maxWidth: '420px', marginBottom: '32px',
          }}>
            Sites web, identité visuelle, référencement local.
            Un interlocuteur unique, réactif et transparent — pour que votre activité soit enfin visible.
          </p>

          {/* Reassurance pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
            {[
              { icon: '⚡', text: 'Réponse sous 24h' },
              { icon: '💬', text: 'Devis gratuit' },
              { icon: '📍', text: 'Studio local' },
            ].map(p => (
              <span key={p.text} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 13px', borderRadius: '100px',
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.07)',
                fontSize: '11px', fontWeight: 500, color: '#3C3C43',
              }}>
                {p.icon} {p.text}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/contact"
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '14px 28px', borderRadius: '100px',
                background: '#1C1C1E', color: '#fff',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.2px',
                textDecoration: 'none',
                boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = '0 14px 36px rgba(0,0,0,0.3)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = ''
                el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.22)'
              }}
            >
              Démarrer un projet →
            </Link>
            <Link
              href="/services"
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '14px 28px', borderRadius: '100px',
                background: 'transparent', color: '#1C1C1E',
                fontSize: '12px', fontWeight: 600,
                textDecoration: 'none',
                border: '1.5px solid rgba(0,0,0,0.14)',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              Nos services
            </Link>
          </div>
        </div>

        {/* ── Right: SVG Illustration ── */}
        <div
          className="hero-illustration"
          style={{ position: 'relative', height: '480px', animation: 'kora-scale-in 0.7s ease 0.15s both' }}
        >
          {/* Badge <24h */}
          <div style={{
            position: 'absolute', top: 0, right: '-4px', zIndex: 10,
            background: 'linear-gradient(135deg, #007AFF, #5856D6)',
            borderRadius: '14px', padding: '11px 16px',
            boxShadow: '0 10px 28px rgba(0,122,255,0.38)',
            animation: 'kora-float 4s ease-in-out 0.5s infinite',
          }}>
            <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.65)', letterSpacing: '1.5px', marginBottom: '2px' }}>RÉPONSE</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{'< 24h'}</div>
          </div>

          {/* Main dark card */}
          <div style={{
            position: 'absolute',
            top: '28px', left: '16px', right: '0', bottom: '72px',
            background: '#13141A',
            borderRadius: '24px',
            padding: '22px 22px 20px',
            boxShadow: '0 40px 100px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.06)',
            animation: 'kora-float 7s ease-in-out infinite',
            display: 'flex', flexDirection: 'column', gap: '14px',
          }}>
            {/* Browser chrome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {['#FF453A', '#FF9F0A', '#30D158'].map(c => (
                <div key={c} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
              ))}
              <div style={{
                flex: 1, height: '6px', marginLeft: '8px',
                background: 'rgba(255,255,255,0.06)', borderRadius: '3px',
              }} />
            </div>

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.28)', letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Analyse de présence web
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Restaurant Le Jardin</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.38)', marginTop: '2px' }}>Lyon, 69001</div>
              </div>
              {/* Score arc */}
              <div style={{ position: 'relative', width: '58px', height: '58px', flexShrink: 0 }}>
                <svg width="58" height="58" viewBox="0 0 58 58" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="29" cy="29" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                  <circle
                    cx="29" cy="29" r="22"
                    fill="none" stroke="#30D158" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 22 * 0.87} ${2 * Math.PI * 22}`}
                    style={{ animation: 'kora-draw-line 1.2s ease 0.4s both' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#30D158', lineHeight: 1 }}>87</span>
                  <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>/100</span>
                </div>
              </div>
            </div>

            {/* Signal rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: '✗', label: 'Site web', status: 'absent', red: true },
                { icon: '✗', label: 'HTTPS', status: 'absent', red: true },
                { icon: '↓', label: 'PageSpeed mobile', status: '28 / 100', red: false },
                { icon: '~', label: 'Google Business', status: 'incomplet', red: false },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: s.red ? '#FF453A' : '#FF9F0A', width: '14px', textAlign: 'center' }}>{s.icon}</span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', flex: 1 }}>{s.label}</span>
                  <span style={{
                    fontSize: '8px', fontWeight: 700,
                    color: s.red ? '#FF453A' : '#FF9F0A',
                    background: s.red ? 'rgba(255,69,58,0.14)' : 'rgba(255,159,10,0.14)',
                    padding: '2px 7px', borderRadius: '5px',
                  }}>{s.status}</span>
                </div>
              ))}
            </div>

            {/* Progress bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Site web', pct: 0, color: '#FF453A' },
                { label: 'HTTPS', pct: 0, color: '#FF453A' },
                { label: 'PageSpeed', pct: 28, color: '#FF9F0A' },
                { label: 'GMB', pct: 55, color: '#FF9F0A' },
              ].map(b => (
                <div key={b.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.28)' }}>{b.label}</span>
                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.28)' }}>{b.pct}%</span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${b.pct}%`, background: b.color, borderRadius: '2px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* CTA inside card */}
            <div style={{
              marginTop: 'auto',
              background: 'linear-gradient(135deg, rgba(48,209,88,0.12), rgba(0,122,255,0.1))',
              border: '1px solid rgba(48,209,88,0.18)',
              borderRadius: '10px', padding: '10px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#30D158' }}>✦ Opportunité détectée</span>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>Ajouter au CRM →</span>
            </div>
          </div>

          {/* Floating white card — bottom left */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            background: '#fff',
            borderRadius: '16px', padding: '13px 17px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.06)',
            animation: 'kora-float-sm 5s ease-in-out 1.5s infinite',
          }}>
            <div style={{ fontSize: '8px', color: '#8E8E93', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '3px' }}>Nouveau prospect</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C1C1E' }}>Boulangerie Morel</div>
            <div style={{ fontSize: '10px', color: '#30D158', marginTop: '2px', fontWeight: 600 }}>Score 91 · Haut potentiel</div>
          </div>
        </div>
      </div>
    </section>
  )
}
