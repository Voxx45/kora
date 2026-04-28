'use client'
import { useState, useTransition } from 'react'
import { upsertProject } from '@/lib/actions/projects'
import type { Project, ProjectFormData, ProjectStatus } from '@/types/crm'

const STATUTS: { value: ProjectStatus; label: string }[] = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'livre',    label: 'Livré' },
  { value: 'facture',  label: 'Facturé' },
]

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.75)',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] uppercase tracking-[1.5px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{label}</label>
      {children}
    </div>
  )
}

interface ProjectFormProps {
  project?: Project
  prospectId?: string
  clientNom?: string
  onClose: () => void
  onSaved: (id: string) => void
}

export function ProjectForm({ project, prospectId, clientNom, onClose, onSaved }: ProjectFormProps) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data: ProjectFormData = {
      id:          project?.id,
      prospect_id: prospectId ?? project?.prospect_id ?? undefined,
      client_nom:  String(fd.get('client_nom') ?? ''),
      service:     String(fd.get('service') ?? ''),
      montant:     fd.get('montant') ? Number(fd.get('montant')) : undefined,
      statut:      fd.get('statut') as ProjectStatus,
      deadline:    String(fd.get('deadline') ?? '') || undefined,
      notes:       String(fd.get('notes') ?? '') || undefined,
    }
    setError(null)
    start(async () => {
      try {
        const { id } = await upsertProject(data)
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
        className="rounded-[16px] p-6 w-[420px] max-w-[92vw] flex flex-col gap-4"
        style={{ background: '#12141E', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {project ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <button onClick={onClose} className="text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Client *">
            <input name="client_nom" defaultValue={project?.client_nom ?? clientNom ?? ''} required className={cls} style={inputStyle} />
          </Field>
          <Field label="Service *">
            <input name="service" defaultValue={project?.service ?? ''} required className={cls} style={inputStyle} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Montant (€)">
              <input name="montant" type="number" min={0} step={50} defaultValue={project?.montant ?? ''} className={cls} style={inputStyle} />
            </Field>
            <Field label="Statut">
              <select name="statut" defaultValue={project?.statut ?? 'en_cours'} className={cls} style={{ ...inputStyle, colorScheme: 'dark' }}>
                {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Deadline">
            <input name="deadline" type="date" defaultValue={project?.deadline ?? ''} className={cls} style={{ ...inputStyle, colorScheme: 'dark' }} />
          </Field>
          <Field label="Notes">
            <textarea name="notes" defaultValue={project?.notes ?? ''} rows={2} className={cls} style={inputStyle} />
          </Field>

          {error && <p className="text-[11px]" style={{ color: '#FF453A' }}>{error}</p>}

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-[10px] text-[11px]" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
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
