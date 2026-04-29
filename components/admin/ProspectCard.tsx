'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { ScoreBadge } from './ScoreBadge'
import type { Prospect } from '@/types/crm'

export function ProspectCard({ prospect }: { prospect: Prospect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: prospect.id })

  const now = new Date()
  const followup = prospect.next_followup_at ? new Date(prospect.next_followup_at) : null

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      className="rounded-[10px] p-3 flex flex-col gap-1.5 cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/prospects/${prospect.id}`}
          onClick={e => e.stopPropagation()}
          className="text-[11px] font-semibold hover:underline"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          {prospect.entreprise ?? prospect.prenom}
        </Link>
        <ScoreBadge score={prospect.score} />
      </div>
      {prospect.service_interesse && (
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{prospect.service_interesse}</p>
      )}
      {prospect.valeur_estimee != null && (
        <p className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {prospect.valeur_estimee} €
        </p>
      )}
      {followup && (
        <p className="text-[9px]" style={{ color: followup < now ? '#FF453A' : 'rgba(255,255,255,0.3)' }}>
          📅 {followup.toLocaleDateString('fr-FR')}
        </p>
      )}
    </div>
  )
}
