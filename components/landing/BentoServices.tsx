import Link from 'next/link'

/* ── Mini SVG illustrations ─────────────────────────────── */

function SvgWeb() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="4" y="10" width="40" height="28" rx="5" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <circle cx="10" cy="17" r="2" fill="#FF453A" />
      <circle cx="17" cy="17" r="2" fill="#FF9F0A" />
      <circle cx="24" cy="17" r="2" fill="#30D158" />
      <rect x="8" y="24" width="14" height="2" rx="1" fill="rgba(255,255,255,0.18)" />
      <rect x="8" y="29" width="10" height="2" rx="1" fill="rgba(255,255,255,0.1)" />
      <rect x="26" y="22" width="14" height="14" rx="3" fill="rgba(255,255,255,0.07)" />
      <rect x="29" y="25" width="8" height="1.5" rx="0.75" fill="rgba(255,255,255,0.2)" />
      <rect x="29" y="28.5" width="6" height="1.5" rx="0.75" fill="rgba(255,255,255,0.12)" />
      <rect x="29" y="32" width="7" height="1.5" rx="0.75" fill="rgba(255,255,255,0.12)" />
    </svg>
  )
}

function SvgIdentite() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="16" cy="20" r="10" fill="rgba(0,122,255,0.18)" />
      <circle cx="26" cy="20" r="10" fill="rgba(88,86,214,0.18)" />
      <path d="M21 13.5a10 10 0 0 1 0 13M19 13.5a10 10 0 0 0 0 13" fill="rgba(88,86,214,0.25)" />
    </svg>
  )
}

function SvgSeo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="8" stroke="#8E8E93" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="20" cy="20" r="3" fill="#1C1C1E" />
      <line x1="20" y1="4" x2="20" y2="10" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="30" x2="20" y2="36" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="20" x2="10" y2="20" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="30" y1="20" x2="36" y2="20" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SvgPrint() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden>
      <rect x="6" y="10" width="26" height="20" rx="3" stroke="#1C1C1E" strokeWidth="1.5" />
      <rect x="10" y="6" width="18" height="12" rx="2" fill="#fff" stroke="#1C1C1E" strokeWidth="1.5" />
      <rect x="13" y="10" width="12" height="1.5" rx="0.75" fill="#D1D1D6" />
      <rect x="13" y="13" width="8" height="1.5" rx="0.75" fill="#D1D1D6" />
      <circle cx="28" cy="26" r="2" fill="#30D158" />
    </svg>
  )
}

function SvgMaint() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden>
      <circle cx="19" cy="19" r="7" stroke="#1C1C1E" strokeWidth="1.5" />
      <circle cx="19" cy="19" r="2.5" fill="#1C1C1E" />
      <path d="M19 5v4M19 29v4M5 19h4M29 19h4" stroke="#1C1C1E" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.4 9.4l2.8 2.8M25.8 25.8l2.8 2.8M28.6 9.4l-2.8 2.8M12.2 25.8l-2.8 2.8" stroke="#D1D1D6" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function SvgReseaux() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden>
      <circle cx="19" cy="19" r="4" fill="#1C1C1E" />
      <circle cx="7" cy="10" r="3" stroke="#8E8E93" strokeWidth="1.5" />
      <circle cx="31" cy="10" r="3" stroke="#8E8E93" strokeWidth="1.5" />
      <circle cx="7" cy="28" r="3" stroke="#8E8E93" strokeWidth="1.5" />
      <circle cx="31" cy="28" r="3" stroke="#8E8E93" strokeWidth="1.5" />
      <line x1="10" y1="11.5" x2="15" y2="16" stroke="#D1D1D6" strokeWidth="1.2" />
      <line x1="23" y1="16" x2="28" y2="11.5" stroke="#D1D1D6" strokeWidth="1.2" />
      <line x1="10" y1="26.5" x2="15" y2="22" stroke="#D1D1D6" strokeWidth="1.2" />
      <line x1="23" y1="22" x2="28" y2="26.5" stroke="#D1D1D6" strokeWidth="1.2" />
    </svg>
  )
}

/* ── Card primitives ────────────────────────────────────── */

function CardDark({
  className, icon, title, price, description, href, children,
}: {
  className: string
  icon: React.ReactNode
  title: string
  price: string
  description: string
  href: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={className}
      style={{
        background: '#13141A',
        borderRadius: '20px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '200px',
      }}
    >
      {/* Subtle glow */}
      <div style={{
        position: 'absolute', top: '-60px', right: '-60px',
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,122,255,0.09) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ marginBottom: '16px' }}>{icon}</div>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
        {price}
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, flex: 1 }}>
        {description}
      </p>
      {children}
      <Link
        href={href}
        style={{
          marginTop: '20px',
          display: 'inline-flex', alignItems: 'center',
          color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600,
          textDecoration: 'none', transition: 'color 150ms',
        }}
      >
        En savoir plus →
      </Link>
    </div>
  )
}

function CardLight({
  className, icon, title, price, description, href,
}: {
  className: string
  icon: React.ReactNode
  title: string
  price: string
  description: string
  href: string
}) {
  return (
    <div
      className={className}
      style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      <div style={{ marginBottom: '14px' }}>{icon}</div>
      <div style={{ fontSize: '9px', color: '#8E8E93', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
        {price}
      </div>
      <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1C1C1E', letterSpacing: '-0.3px', marginBottom: '6px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '11px', color: '#8E8E93', lineHeight: 1.6, flex: 1 }}>
        {description}
      </p>
      <Link
        href={href}
        style={{
          marginTop: '14px',
          display: 'inline-flex', alignItems: 'center',
          color: '#1C1C1E', fontSize: '11px', fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Découvrir →
      </Link>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────── */

export function BentoServices() {
  return (
    <section style={{ background: '#F2F2F7', padding: '80px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#8E8E93', marginBottom: '12px' }}>
            Nos services
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#1C1C1E', lineHeight: 1.05 }}>
            Tout ce qu&apos;il vous faut<br />
            <span style={{ fontWeight: 300, color: '#8E8E93' }}>pour exister en ligne.</span>
          </h2>
        </div>

        {/* Bento grid */}
        <div className="bento-grid" style={{ gap: '12px' }}>

          {/* Site web — grand, sombre */}
          <CardDark
            className="bento-site-web"
            icon={<SvgWeb />}
            title="Création de site web"
            price="À partir de 800 €"
            description="Sur-mesure, mobile-first, optimisé pour convertir. On s'occupe de tout — de la maquette à la mise en ligne — avec un résultat qui dure."
            href="/services#site-web"
          >
            {/* Mini includes list */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {['Design responsive sur-mesure', 'Core Web Vitals optimisés', 'Formulaire de contact intégré', 'Hébergement conseillé'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '9px', color: '#30D158', flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.38)' }}>{item}</span>
                </div>
              ))}
            </div>
          </CardDark>

          {/* Identité — clair */}
          <CardLight
            className="bento-identite"
            icon={<SvgIdentite />}
            title="Identité visuelle"
            price="À partir de 350 €"
            description="Logo, charte graphique, supports — une image cohérente et mémorable qui inspire confiance."
            href="/services#identite"
          />

          {/* SEO — clair */}
          <CardLight
            className="bento-seo"
            icon={<SvgSeo />}
            title="Référencement local"
            price="150 €/mois"
            description="Google Maps, mots-clés locaux, annuaires. Soyez trouvé au moment où vos clients vous cherchent."
            href="/services#seo-local"
          />

          {/* Print */}
          <CardLight
            className="bento-print"
            icon={<SvgPrint />}
            title="Supports print"
            price="À partir de 120 €"
            description="Flyers, affiches, cartes de visite — fichiers prêts à imprimer."
            href="/services#print"
          />

          {/* Maintenance */}
          <CardLight
            className="bento-maint"
            icon={<SvgMaint />}
            title="Maintenance"
            price="60 €/mois"
            description="Mises à jour, sauvegardes, sécurité — on s'en occupe, vous dormez tranquille."
            href="/services#maintenance"
          />

          {/* Réseaux */}
          <CardLight
            className="bento-reseaux"
            icon={<SvgReseaux />}
            title="Réseaux sociaux"
            price="200 €/mois"
            description="Contenu, publications, gestion — une présence régulière et cohérente sur les réseaux qui comptent."
            href="/services#reseaux"
          />

        </div>
      </div>
    </section>
  )
}
