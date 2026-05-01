export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "On avait un site vieillissant et aucune visibilité sur Google. En deux mois, on est passé premier sur « coiffeur Lyon 3 ». Le résultat a dépassé ce qu'on espérait.",
      name: 'Sophie Renard',
      role: 'Gérante — Salon Elore, Lyon',
      initials: 'SR',
      color: '#007AFF',
    },
    {
      quote: "Réactif, carré, et pas de jargon inutile. J'ai eu mon site en trois semaines, avec une charte graphique que j'aurais pas pu me payer ailleurs. Je recommande sans hésitation.",
      name: 'Marc Lefebvre',
      role: 'Artisan plombier — Villeurbanne',
      initials: 'ML',
      color: '#5856D6',
    },
    {
      quote: "La gestion des réseaux me prenait un temps fou. Depuis qu'on délègue à KORA, notre Instagram a doublé d'abonnés et je me concentre sur mon cœur de métier.",
      name: 'Camille Arnaud',
      role: 'Co-fondatrice — Studio Bloom',
      initials: 'CA',
      color: '#30D158',
    },
  ]

  return (
    <section style={{ background: '#F2F2F7', padding: '88px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#8E8E93', marginBottom: '12px' }}>
            Témoignages
          </p>
          <h2 style={{ fontSize: 'clamp(26px, 3.2vw, 40px)', fontWeight: 900, letterSpacing: '-1.2px', color: '#1C1C1E', lineHeight: 1.08 }}>
            Ils nous ont fait confiance.
          </h2>
        </div>

        {/* Cards */}
        <div
          className="testimonials-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}
        >
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(0,0,0,0.05)',
                animation: `kora-fade-up 0.5s ease ${i * 0.1}s both`,
              }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', gap: '3px', marginBottom: '18px' }}>
                {[...Array(5)].map((_, si) => (
                  <svg key={si} width="12" height="12" viewBox="0 0 12 12" fill={t.color} aria-hidden>
                    <path d="M6 1l1.29 2.61L10.5 4.1l-2.25 2.19.53 3.1L6 7.77 3.22 9.39l.53-3.1L1.5 4.1l3.21-.49L6 1z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p style={{
                fontSize: '13px', lineHeight: 1.7, color: '#3C3C43',
                flex: 1, fontStyle: 'normal',
                marginBottom: '24px',
              }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${t.color}22, ${t.color}44)`,
                  border: `1.5px solid ${t.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: t.color }}>{t.initials}</span>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1C1C1E' }}>{t.name}</div>
                  <div style={{ fontSize: '10px', color: '#8E8E93', marginTop: '1px' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div style={{
          marginTop: '36px',
          padding: '18px 24px',
          borderRadius: '16px',
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
          flexWrap: 'wrap',
        }}>
          {[
            { icon: '✦', text: '+50 clients accompagnés' },
            { icon: '★', text: '4.9 / 5 de satisfaction' },
            { icon: '◎', text: '100 % clients satisfaits' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ color: '#8E8E93', fontSize: '10px' }}>{item.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#3C3C43' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .testimonials-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1023px) {
          .testimonials-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
