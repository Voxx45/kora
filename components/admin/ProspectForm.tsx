'use client'
import { useState, useTransition } from 'react'
import { upsertProspect } from '@/lib/actions/prospects'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { FollowupPicker } from '@/components/admin/FollowupPicker'
import type { Prospect, ProspectFormData, PipelineStage } from '@/types/crm'

const STAGES: { value: PipelineStage; label: string }[] = [
  { value: 'nouveau',      label: 'Nouveau' },
  { value: 'contacte',     label: 'Contacté' },
  { value: 'devis_envoye', label: 'Devis envoyé' },
  { value: 'negocia',      label: 'En négociation' },
  { value: 'gagne',        label: 'Gagné' },
  { value: 'perdu',        label: 'Perdu' },
]

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.75)',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] uppercase tracking-[1.5px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

interface ProspectFormProps {
  prospect?: Prospect
  onClose: () => void
  onSaved: (id: string) => void
}

export function ProspectForm({ prospect, onClose, onSaved }: ProspectFormProps) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [score, setScore] = useState(prospect?.score ?? 50)
  const [followup, setFollowup] = useState<string | null>(prospect?.next_followup_at ?? null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data: ProspectFormData = {
      id:                prospect?.id,
      prenom:            String(fd.get('prenom') ?? ''),
      email:             String(fd.get('email') ?? ''),
      telephone:         String(fd.get('telephone') ?? '') || undefined,
      entreprise:        String(fd.get('entreprise') ?? '') || undefined,
      service_interesse: String(fd.get('service_interesse') ?? '') || undefined,
      message:           String(fd.get('message') ?? '') || undefined,
      score,
      pipeline_stage:    fd.get('pipeline_stage') as PipelineStage,
      valeur_estimee:    fd.get('valeur_estimee') ? Number(fd.get('valeur_estimee')) : undefined,
      next_followup_at:  followup ?? undefined,
      notes:             String(fd.get('notes') ?? '') || undefined,
    }
    setError(null)
    startTransition(async () => {
      try {
        const { id } = await upsertProspect(data)
        onSaved(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      }
    })
  }

  const cls = 'text-[11px] px-3 py-2 rounded-[10px] outline-none w-full'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-[16px] p-6 w-[480px] max-w-[92vw] max-h-[90vh] overflow-y-auto flex flex-col gap-4"
        style={{ background: '#12141E', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {prospect ? 'Modifier le prospect' : 'Ajouter un prospect'}
          </h2>
          <button onClick={onClose} className="text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom *">
              <input name="prenom" defaultValue={prospect?.prenom} required className={cls} style={inputStyle} />
            </Field>
            <Field label="Email *">
              <input name="email" type="email" defaultValue={prospect?.email} required className={cls} style={inputStyle} />
            </Field>
            <Field label="Téléphone">
              <input name="telephone" defaultValue={prospect?.telephone ?? ''} className={cls} style={inputStyle} />
            </Field>
            <Field label="Entreprise">
              <input name="entreprise" defaultValue={prospect?.entreprise ?? ''} className={cls} style={inputStyle} />
            </Field>
          </div>

          <Field label="Service intéressé">
            <input name="service_interesse" defaultValue={prospect?.service_interesse ?? ''} className={cls} style={inputStyle} />
          </Field>

          <Field label="Message">
            <textarea name="message" defaultValue={prospect?.message ?? ''} rows={3} className={cls} style={inputStyle} />
          </Field>

          <Field label={`Score — ${score}`}>
            <div className="flex items-center gap-3">
              <input
                type="range" min={0} max={100} value={score}
                onChange={e => setScore(Number(e.target.value))}
                className="flex-1"
              />
              <ScoreBadge score={score} />
            </div>
          </Field>

          <Field label="Étape pipeline">
            <select name="pipeline_stage" defaultValue={prospect?.pipeline_stage ?? 'nouveau'} className={cls} style={{ ...inputStyle, colorScheme: 'dark' }}>
              {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>

          <Field label="Valeur estimée (€)">
            <input name="valeur_estimee" type="number" min={0} step={50} defaultValue={prospect?.valeur_estimee ?? ''} className={cls} style={inputStyle} />
          </Field>

          <FollowupPicker value={followup} onChange={setFollowup} />

          <Field label="Notes">
            <textarea name="notes" defaultValue={prospect?.notes ?? ''} rows={2} className={cls} style={inputStyle} />
          </Field>

          {error && <p className="text-[11px]" style={{ color: '#FF453A' }}>{error}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[10px] text-[11px]"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 rounded-[10px] text-[11px] font-semibold"
              style={{ background: 'linear-gradient(135deg,#FCD34D,#F97316)', color: '#000', opacity: pending ? 0.6 : 1 }}
            >
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
