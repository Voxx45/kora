'use client'
import { DataTable } from '@/components/admin/DataTable'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { PipelineBadge } from '@/components/admin/StatusBadge'
import { useDrawer } from '@/lib/contexts/drawer-context'
import type { Prospect } from '@/types/crm'

export function DashboardProspects({ prospects }: { prospects: Prospect[] }) {
  const { openDrawer } = useDrawer()
  const now = new Date()

  return (
    <DataTable<Prospect>
      columns={[
        {
          key: 'entreprise',
          label: 'Entreprise',
          render: (r: Prospect) => r.entreprise ?? r.prenom,
        },
        {
          key: 'score',
          label: 'Score',
          render: (r: Prospect) => <ScoreBadge score={r.score} />,
        },
        {
          key: 'pipeline_stage',
          label: 'Statut',
          render: (r: Prospect) => <PipelineBadge stage={r.pipeline_stage} />,
        },
        {
          key: 'next_followup_at',
          label: 'Relance',
          render: (r: Prospect) => {
            if (!r.next_followup_at) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
            const d = new Date(r.next_followup_at)
            return (
              <span style={{ color: d < now ? '#FF453A' : 'rgba(255,255,255,0.6)' }}>
                {d.toLocaleDateString('fr-FR')}
              </span>
            )
          },
        },
      ]}
      rows={prospects}
      keyExtractor={(r: Prospect) => r.id}
      emptyMessage="Aucun prospect pour l'instant"
      onRowClick={(r: Prospect) => openDrawer({ type: 'prospect', data: r })}
    />
  )
}
