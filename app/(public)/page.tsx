import { HeroSection } from '@/components/landing/HeroSection'
import { MarqueeBand } from '@/components/landing/MarqueeBand'
import { StatsSection } from '@/components/landing/StatsSection'
import { BentoServices } from '@/components/landing/BentoServices'
import { WhyKora } from '@/components/landing/WhyKora'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { CtaBand } from '@/components/CtaBand'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KORA — Studio digital local pour TPE et PME',
  description: 'Création de site web, identité visuelle et référencement local. Studio indépendant, réactif et transparent.',
}

export default function HomePage() {
  return (
    <>
      {/* §1 — Hero: split layout avec dashboard SVG animé */}
      <HeroSection />

      {/* §2 — Marquee ticker */}
      <MarqueeBand />

      {/* §3 — Stats animées au scroll */}
      <StatsSection />

      {/* §4 — Bento services */}
      <BentoServices />

      {/* §5 — Pourquoi KORA : 3 piliers */}
      <WhyKora />

      {/* §6 — Témoignages */}
      <TestimonialsSection />

      {/* §7 — CTA final */}
      <CtaBand
        title={"Prêt à donner une vraie présence\nà votre activité ?"}
        subtitle="Devis gratuit · Réponse sous 24h · Sans engagement"
        ctaLabel="Démarrer mon projet →"
        ctaHref="/contact"
      />
    </>
  )
}
