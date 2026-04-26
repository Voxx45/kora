import Link from 'next/link'
import { SectionLabel } from '@/components/SectionLabel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'À propos — KORA Studio digital',
  description: 'KORA est un studio digital local et indépendant spécialisé pour les TPE et PME. Bientôt plus de détails.',
}

export default function AProposPage() {
  return (
    <section className="max-w-[600px] mx-auto px-6 py-32 text-center">
      <SectionLabel className="mb-4">À PROPOS</SectionLabel>
      <h1 className="text-[40px] font-black tracking-[-1.5px] text-[#1C1C1E] leading-[1.08] mb-5">
        On vous en dit plus<br />
        <span style={{ color: '#8E8E93', fontWeight: 300 }}>très bientôt.</span>
      </h1>
      <p className="text-[14px] leading-[1.7] mb-10" style={{ color: '#8E8E93' }}>
        Cette page est en cours de rédaction.<br />
        En attendant, n&apos;hésitez pas à nous contacter directement.
      </p>
      <Link
        href="/contact"
        className="inline-flex items-center text-[12px] font-semibold px-6 py-3 rounded-[100px] bg-[#1C1C1E] text-white hover:bg-[#2C2C2E] transition-colors"
      >
        Prendre contact →
      </Link>
    </section>
  )
}
