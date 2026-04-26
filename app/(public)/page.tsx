import Link from 'next/link'
import { SectionLabel } from '@/components/SectionLabel'
import { ServiceCard } from '@/components/ServiceCard'
import { CtaBand } from '@/components/CtaBand'
import type { Metadata } from 'next'

const SERVICES = [
  { icon: '🌐', title: 'Création de site web', description: 'Sur-mesure, mobile-first, optimisé pour convertir vos visiteurs.', href: '/services#site-web' },
  { icon: '🎨', title: 'Identité visuelle', description: 'Logo, charte graphique, supports — une image cohérente et mémorable.', href: '/services#identite' },
  { icon: '📍', title: 'Référencement local', description: 'Google Maps, SEO local — être trouvé par vos clients de proximité.', href: '/services#seo-local' },
  { icon: '🖨️', title: 'Supports print', description: "Affiches, flyers, cartes de visite prêts à l'impression.", href: '/services#print' },
  { icon: '🔧', title: 'Maintenance & support', description: "Suivi mensuel, mises à jour, tranquillité d'esprit.", href: '/services#maintenance' },
  { icon: '📱', title: 'Réseaux sociaux', description: 'Gestion de pages, création de contenu et stratégie éditoriale.', href: '/services#reseaux' },
]

export const metadata: Metadata = {
  title: 'KORA — Studio digital local pour TPE et PME',
  description: 'Création de site web, identité visuelle et référencement local. Studio indépendant, réactif et transparent.',
}

export default function HomePage() {
  return (
    <>
      {/* Section 1 — Hero */}
      <section className="max-w-[1100px] mx-auto px-6 py-24 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[2.5px] mb-4" style={{ color: '#8E8E93' }}>
          Studio digital · Local & Indépendant · Réactif
        </p>
        <h1 className="text-[48px] font-black tracking-[-2px] text-[#1C1C1E] leading-[1.05] mb-5">
          Votre activité mérite<br />
          <span style={{ color: '#8E8E93', fontWeight: 300 }}>une vraie vitrine.</span>
        </h1>
        <p className="text-[14px] max-w-[420px] mx-auto mb-8 leading-[1.65]" style={{ color: '#8E8E93' }}>
          Sites web, identité visuelle, référencement local.
          On transforme votre présence digitale en moteur de croissance.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/contact"
            className="text-[12px] font-semibold px-6 py-[11px] rounded-[100px] bg-[#1C1C1E] text-white hover:bg-[#2C2C2E] transition-colors"
          >
            Démarrer un projet →
          </Link>
          <Link
            href="/portfolio"
            className="text-[12px] font-medium px-6 py-[11px] rounded-[100px] hover:bg-black/10 transition-colors"
            style={{ background: 'rgba(0,0,0,0.06)', color: '#1C1C1E' }}
          >
            Voir les réalisations
          </Link>
        </div>
      </section>

      {/* Section 2 — Services */}
      <section className="py-16 px-6" style={{ background: '#F2F2F7' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-2">
            <SectionLabel>NOS SERVICES</SectionLabel>
          </div>
          <h2 className="text-[28px] font-bold tracking-[-0.8px] text-[#1C1C1E] text-center mb-10">
            Tout ce qu&apos;il vous faut pour exister en ligne.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map(s => (
              <ServiceCard key={s.href} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — CTA final */}
      <CtaBand
        title={"Prêt à donner une vraie présence\nà votre activité ?"}
        subtitle="Devis gratuit · Réponse sous 24h · Sans engagement"
        ctaLabel="Démarrer mon projet →"
        ctaHref="/contact"
      />
    </>
  )
}
