'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteProspect } from '@/lib/actions/prospects'
import { ProspectForm } from '@/components/admin/ProspectForm'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { PipelineBadge } from '@/components/admin/StatusBadge'
import { DataTable } from '@/components/admin/DataTable'
import type { Prospect, PipelineStage } from '@/types/crm'

const SOURCE_LABEL: Record<string, string> = {
  contact_form: '🌐 Formulaire',
  manual:       '✋ Manuel',
  scanner:      '🤖 Scanner',
}

const FILTERS: { value: PipelineStage | 'all'; label: string }[] = [
  { value: 'all',          label: 'Tous' },
  { value: 'nouveau',      label: 'Nouveau' },
  { value: 'contacte',     label: 'Contacté' },
  { value: 'devis_envoye', label: 'Devis' },
  { value: 'gagne',        label: 'Gagné' },
  { value: 'perdu',        label: 'Perdu' },
]

interface Props { prospects: Prospect[] }

export function ProspectsClient({ prospects }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<PipelineStage | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [, startTransition] = useTransition()

  const now = new Date()
  const visible = filter === 'all' ? prospects : prospects.filter(p => p.pipeline_stage === filter)
  const sorted = [...visible].sort((a, b) => b.score - a.score)

  function handleDelete(id: string) {
    if (!confirm('Supprimer ce prospect ?')) return
    startTransition(async () => {
      await deleteProspect(id)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <span>KORA</span><span>/</span>
          <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>Prospects</span>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="px-3 py-1.5 rounded-[10px] text-[11px] font-semibold"
          style={{ background: 'linear-gradient(135deg,#FCD34D,#F97316)', color: '#000' }}
        >
          ＋ Ajouter un prospect
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {/* Filtres */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-3 py-1 rounded-full text-[10px] font-semibold"
              style={
                filter === f.value
                  ? { background: 'linear-gradient(135deg,#FCD34D,#F97316)', color: '#000' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucun prospect</p>
            <button
              onClick={() => setFormOpen(true)}
              className="px-4 py-2 rounded-[10px] text-[11px] font-semibold"
              style={{ background: 'linear-gradient(135deg,#FCD34D,#F97316)', color: '#000' }}
            >
              ＋ Ajouter un prospect
            </button>
          </div>
        ) : (
          <DataTable<Prospect>
            columns={[
              {
                key: 'entreprise',
                label: 'Entreprise',
                width: '2fr',
                render: (r: Prospect) => (
                  <Link href={`/admin/prospects/${r.id}`} className="hover:underline" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {r.entreprise ?? r.prenom}
                  </Link>
                ),
              },
              { key: 'source', label: 'Source', render: (r: Prospect) => SOURCE_LABEL[r.source] ?? r.source },
              { key: 'score', label: 'Score', render: (r: Prospect) => <ScoreBadge score={r.score} /> },
              { key: 'service', label: 'Service', render: (r: Prospect) => r.service_interesse ?? '—' },
              { key: 'pipeline_stage', label: 'Étape', render: (r: Prospect) => <PipelineBadge stage={r.pipeline_stage} /> },
              {
                key: 'next_followup_at',
                label: 'Relance',
                render: (r: Prospect) => {
                  if (!r.next_followup_at) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                  const d = new Date(r.next_followup_at)
                  return <span style={{ color: d < now ? '#FF453A' : 'rgba(255,255,255,0.6)' }}>{d.toLocaleDateString('fr-FR')}</span>
                },
              },
              {
                key: 'actions',
                label: '',
                width: '80px',
                render: (r: Prospect) => (
                  <div className="flex gap-2">
                    <Link href={`/admin/prospects/${r.id}`} className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>✏</Link>
                    <button onClick={() => handleDelete(r.id)} className="text-[11px]" style={{ color: 'rgba(255,69,58,0.6)' }}>✕</button>
                  </div>
                ),
              },
            ]}
            rows={sorted}
            keyExtractor={(r: Prospect) => r.id}
          />
        )}
      </div>

      {formOpen && (
        <ProspectForm
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); router.refresh() }}
        />
      )}
    </div>
  )
}
