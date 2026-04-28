'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProspectForm } from '@/components/admin/ProspectForm'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { PipelineBadge } from '@/components/admin/StatusBadge'
import type { Prospect } from '@/types/crm'

export function FicheClient({ prospect }: { prospect: Prospect }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)

  const now = new Date()
  const followup = prospect.next_followup_at ? new Date(prospect.next_followup_at) : null

  function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
      <div className="flex justify-between items-start py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="text-[10px] uppercase tracking-[1px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{label}</span>
        <span className="text-[11px] text-right max-w-[60%]" style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[600px] mx-auto flex flex-col gap-4">

        {/* Carte principale */}
        <div
          className="rounded-[14px] p-5 flex flex-col gap-1"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-[16px] font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {prospect.entreprise ?? prospect.prenom}
            </h1>
            <div className="flex gap-2 items-center">
              <ScoreBadge score={prospect.score} />
              <PipelineBadge stage={prospect.pipeline_stage} />
            </div>
          </div>

          <Row label="Prénom" value={prospect.prenom} />
          <Row label="Email" value={<a href={`mailto:${prospect.email}`} style={{ color: '#0A84FF' }}>{prospect.email}</a>} />
          <Row label="Téléphone" value={prospect.telephone ?? '—'} />
          <Row label="Entreprise" value={prospect.entreprise ?? '—'} />
          <Row label="Service" value={prospect.service_interesse ?? '—'} />
          <Row label="Source" value={prospect.source} />
          <Row label="Valeur estimée" value={prospect.valeur_estimee != null ? `${prospect.valeur_estimee} €` : '—'} />
          <Row
            label="Relance"
            value={
              followup
                ? <span style={{ color: followup < now ? '#FF453A' : 'rgba(255,255,255,0.7)' }}>
                    {followup.toLocaleString('fr-FR')}
                  </span>
                : '—'
            }
          />
          <Row label="Créé le" value={new Date(prospect.created_at).toLocaleDateString('fr-FR')} />
          <Row label="Modifié le" value={new Date(prospect.updated_at).toLocaleDateString('fr-FR')} />
        </div>

        {/* Notes */}
        {prospect.notes && (
          <div
            className="rounded-[14px] p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[9px] uppercase tracking-[1.5px] mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>Notes</p>
            <p className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{prospect.notes}</p>
          </div>
        )}

        {/* Message original */}
        {prospect.message && (
          <div
            className="rounded-[14px] p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[9px] uppercase tracking-[1.5px] mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>Message initial</p>
            <p className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{prospect.message}</p>
          </div>
        )}

        {/* Action */}
        <button
          onClick={() => setEditOpen(true)}
          className="py-2.5 rounded-[10px] text-[11px] font-semibold"
          style={{ background: 'linear-gradient(135deg,#FCD34D,#F97316)', color: '#000' }}
        >
          ✏ Modifier
        </button>
      </div>

      {editOpen && (
        <ProspectForm
          prospect={prospect}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); router.refresh() }}
        />
      )}
    </div>
  )
}
