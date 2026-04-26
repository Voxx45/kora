import { Suspense } from 'react'
import { ContactForm } from '@/components/ContactForm'
import { ChatAssistant } from '@/components/ChatAssistant'
import { SectionLabel } from '@/components/SectionLabel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — KORA Studio digital',
  description: 'Démarrez votre projet avec KORA. Devis gratuit, réponse sous 24h. Formulaire de contact et assistant IA disponibles.',
}

export default function ContactPage() {
  return (
    <section className="max-w-[1100px] mx-auto px-6 py-16">
      <div className="max-w-[560px] mb-12">
        <SectionLabel className="mb-3">PARLONS-EN</SectionLabel>
        <h1 className="text-[40px] font-black tracking-[-1.5px] text-[#1C1C1E] leading-[1.08] mb-3">
          Démarrons<br />votre projet.
        </h1>
        <p className="text-[14px] leading-[1.7]" style={{ color: '#8E8E93' }}>
          Réponse garantie sous 24h · Devis gratuit · Sans engagement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-10 items-start">
        {/* Formulaire */}
        <div
          className="rounded-[20px] p-7"
          style={{ background: '#FAFAFA', border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>

        {/* Chat IA */}
        <div className="lg:sticky lg:top-20">
          <ChatAssistant />
        </div>
      </div>
    </section>
  )
}
