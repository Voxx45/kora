import React from 'react'

function IconLocal() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="14" r="6" stroke="#007AFF" strokeWidth="1.8" />
      <circle cx="16" cy="14" r="2.2" fill="#007AFF" />
      <path d="M16 20c-6 0-10 2.5-10 4.5S10 29 16 29s10-2 10-4.5S22 20 16 20z" fill="rgba(0,122,255,0.1)" stroke="#007AFF" strokeWidth="1.4" />
    </svg>
  )
}

function IconPrice() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="4" y="8" width="24" height="16" rx="4" stroke="#30D158" strokeWidth="1.8" />
      <path d="M16 12v8M13 14.5c0-1.38 1.34-2.5 3-2.5s3 1.12 3 2.5c0 1.38-1.34 2.5-3 2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3-1.12 3-2.5" stroke="#30D158" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconContact() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="13" r="5" stroke="#5856D6" strokeWidth="1.8" />
      <path d="M6 27c0-4.42 4.48-8 10-8s10 3.58 10 8" stroke="#5856D6" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="24" cy="10" r="4" fill="rgba(88,86,214,0.15)" stroke="#5856D6" strokeWidth="1.4" />
      <path d="M22.5 10h3M24 8.5v3" stroke="#5856D6" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

const PILLARS = [
  {
    icon: <IconLocal />,
    accent: '#007AFF',
    tag: 'Local & disponible',
    title: 'Un vrai interlocuteur,\nà côté de chez vous.',
    body: 'Pas de plateforme, pas de ticket. Vous avez une question à 18h ? Vous m\'écrivez. Je réponds. On travaille ensemble, en direct, sans intermédiaire.',
    stat: '< 24h',
    statLabel: 'de réponse garantie',
  },
  {
    icon: <IconPrice />,
    accent: '#30D158',
    tag: 'Prix transparents',
    title: 'Vous savez exactement\nce que vous payez.',
    body: 'Devis détaillé, tarif fixe, zéro surprise. Pas d\'heures cachées, pas de forfait flou. Le prix annoncé est le prix facturé.',
    stat: '0€',
    statLabel: 'de frais cachés',
  },
  {
    icon: <IconContact />,
    accent: '#5856D6',
    tag: 'Interlocuteur unique',
    title: 'Un seul contact\npour tout gérer.',
    body: 'Du design à la mise en ligne, de la charte graphique au référencement — tout passe par moi. Vous ne réexpliquez pas votre projet à chaque fois.',
    stat: '1',
    statLabel: 'interlocuteur unique',
  },
]

export function WhyKora() {
  return (
    <section style={{ background: '#fff', padding: '88px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '56px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#8E8E93', marginBottom: '12px' }}>
            Pourquoi KORA
          </p>
          <h2 style={{ fontSize: 'clamp(26px, 3.2vw, 40px)', fontWeight: 900, letterSpacing: '-1.2px', color: '#1C1C1E', lineHeight: 1.08, maxWidth: '480px' }}>
            Simple, direct,<br />
            <span style={{ fontWeight: 300, color: '#8E8E93' }}>sans prise de tête.</span>
          </h2>
        </div>

        {/* Pillars */}
        <div
          className="why-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}
        >
          {PILLARS.map((p, i) => (
            <div
              key={p.tag}
              style={{
                padding: '32px',
                borderRadius: '20px',
                background: '#F2F2F7',
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                position: 'relative',
                overflow: 'hidden',
                animation: `kora-fade-up 0.5s ease ${i * 0.12}s both`,
              }}
            >
              {/* Accent line top */}
              <div style={{
                position: 'absolute', top: 0, left: '32px', right: '32px',
                height: '2px', borderRadius: '0 0 2px 2px',
                background: `linear-gradient(90deg, ${p.accent}, transparent)`,
              }} />

              {/* Icon */}
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                {p.icon}
              </div>

              {/* Tag */}
              <span style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '1.8px',
                textTransform: 'uppercase', color: p.accent, marginBottom: '10px',
              }}>
                {p.tag}
              </span>

              {/* Title */}
              <h3 style={{
                fontSize: '17px', fontWeight: 800, color: '#1C1C1E',
                letterSpacing: '-0.4px', lineHeight: 1.25, marginBottom: '14px',
                whiteSpace: 'pre-line',
              }}>
                {p.title}
              </h3>

              {/* Body */}
              <p style={{ fontSize: '12px', color: '#8E8E93', lineHeight: 1.7, flex: 1 }}>
                {p.body}
              </p>

              {/* Stat */}
              <div style={{
                marginTop: '24px',
                padding: '14px 18px',
                borderRadius: '12px',
                background: '#fff',
                display: 'flex', alignItems: 'baseline', gap: '8px',
              }}>
                <span style={{ fontSize: '26px', fontWeight: 900, color: p.accent, letterSpacing: '-1px', lineHeight: 1 }}>
                  {p.stat}
                </span>
                <span style={{ fontSize: '10px', color: '#8E8E93', fontWeight: 500 }}>
                  {p.statLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .why-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1023px) {
          .why-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
