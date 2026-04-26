'use client'

import { useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

const SERVICES = [
  'Création de site web',
  'Identité visuelle',
  'Référencement local',
  'Supports print',
  'Maintenance & support',
  'Réseaux sociaux',
  'Autre',
]

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm() {
  const searchParams = useSearchParams()
  const defaultService = searchParams.get('service') ?? ''

  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    const data = new FormData(e.currentTarget)
    const payload = {
      prenom:     (data.get('prenom') as string).trim(),
      email:      (data.get('email') as string).trim(),
      telephone:  (data.get('telephone') as string)?.trim() || undefined,
      entreprise: (data.get('entreprise') as string)?.trim() || undefined,
      service:    data.get('service') as string,
      message:    (data.get('message') as string).trim(),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json() as { error?: string }
        throw new Error(body.error ?? 'Erreur inconnue')
      }
      setState('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inattendue')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="text-[40px]">✅</div>
        <h3 className="text-[18px] font-bold text-[#1C1C1E]">Message envoyé !</h3>
        <p className="text-[13px]" style={{ color: '#8E8E93' }}>
          On revient vers vous sous 24h. À très vite !
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Prénom" name="prenom" id="contact-prenom" required placeholder="Marie" />
        <Input label="Email" name="email" id="contact-email" type="email" required placeholder="marie@exemple.fr" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Téléphone (optionnel)" name="telephone" id="contact-tel" placeholder="06 01 02 03 04" />
        <Input label="Entreprise (optionnel)" name="entreprise" id="contact-entreprise" placeholder="Café du coin" />
      </div>

      {/* Select stylé */}
      <div className="relative">
        <label
          htmlFor="contact-service"
          className="absolute -top-[9px] left-[10px] text-[9px] font-semibold uppercase tracking-[1px] px-1 z-10"
          style={{ color: '#8E8E93', background: 'white' }}
        >
          Service intéressé *
        </label>
        <select
          name="service"
          id="contact-service"
          required
          defaultValue={defaultService}
          className="w-full text-[13px] px-[14px] py-2.5 rounded-[12px] border border-black/10 bg-white text-[#1C1C1E] outline-none appearance-none focus:border-black/30"
        >
          <option value="" disabled>Choisissez un service…</option>
          {SERVICES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Textarea */}
      <div className="relative">
        <label
          htmlFor="contact-message"
          className="absolute -top-[9px] left-[10px] text-[9px] font-semibold uppercase tracking-[1px] px-1 z-10"
          style={{ color: '#8E8E93', background: 'white' }}
        >
          Message *
        </label>
        <textarea
          name="message"
          id="contact-message"
          required
          rows={4}
          placeholder="Décrivez votre projet en quelques mots…"
          className="w-full text-[13px] px-[14px] py-2.5 rounded-[12px] border border-black/10 bg-white text-[#1C1C1E] outline-none resize-none focus:border-black/30"
        />
      </div>

      {state === 'error' && (
        <p className="text-[12px]" style={{ color: '#FF453A' }}>{errorMsg}</p>
      )}

      <Button type="submit" disabled={state === 'loading'}>
        {state === 'loading' ? 'Envoi en cours…' : 'Envoyer mon message →'}
      </Button>
    </form>
  )
}
