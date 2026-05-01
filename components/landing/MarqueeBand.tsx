'use client'

const ITEMS = [
  'Création de site web',
  'Identité visuelle',
  'Référencement local',
  'Supports print',
  'Maintenance mensuelle',
  'Réseaux sociaux',
  'Devis gratuit',
  'Réponse sous 24h',
  'Studio local & indépendant',
]

export function MarqueeBand() {
  return (
    <div
      style={{
        background: '#1C1C1E',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        padding: '13px 0',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          animation: 'kora-marquee 28s linear infinite',
        }}
      >
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              padding: '0 22px',
              whiteSpace: 'nowrap',
            }}>
              {item}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '5px', lineHeight: 1 }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  )
}
