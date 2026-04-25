import { PortfolioGrid, type Project } from '@/components/PortfolioGrid'
import { SectionLabel } from '@/components/SectionLabel'
import { CtaBand } from '@/components/CtaBand'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio — KORA Studio digital',
  description: 'Découvrez nos réalisations : sites web, identités visuelles et référencement local pour des TPE et PME locales.',
}

const PROJECTS: Project[] = [
  { id: '1', client: 'Restaurant Le Jardin',     category: 'site-web', services: 'Site web · SEO local',       gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', tall: true },
  { id: '2', client: 'Plombier Bertrand & Fils', category: 'identite', services: 'Identité visuelle · Print',  gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: '3', client: 'Salon Lumière',            category: 'site-web', services: 'Site web · Réseaux sociaux', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: '4', client: 'Boulangerie Cœur de Blé', category: 'seo',      services: 'SEO local · Google Maps',    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', tall: true },
  { id: '5', client: 'Cabinet Dr. Morel',        category: 'identite', services: 'Identité visuelle',          gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: '6', client: 'Auto-école Liberté',       category: 'site-web', services: 'Site web · Print',           gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
]

export default function PortfolioPage() {
  return (
    <>
      <section className="max-w-[700px] mx-auto px-6 py-16 text-center">
        <SectionLabel className="mb-3">NOS RÉALISATIONS</SectionLabel>
        <h1 className="text-[40px] font-black tracking-[-1.5px] text-[#1C1C1E] leading-[1.08] mb-4">
          Des projets pensés<br />
          pour des vrais gens.
        </h1>
        <p className="text-[14px] leading-[1.7]" style={{ color: '#8E8E93' }}>
          Chaque réalisation, une histoire de confiance.
        </p>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 pb-20">
        <PortfolioGrid projects={PROJECTS} />
      </section>

      <CtaBand
        title="Votre projet est le prochain."
        subtitle="Parlons de votre activité et de ce qu'on peut construire ensemble."
        ctaLabel="Démarrer mon projet →"
        ctaHref="/contact"
      />
    </>
  )
}
