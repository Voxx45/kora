import { createSupabaseServerClient } from '@/lib/supabase-server'
import { KpiCard } from '@/components/admin/KpiCard'
import { DataTable } from '@/components/admin/DataTable'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { PipelineBadge } from '@/components/admin/StatusBadge'
import type { Prospect } from '@/types/crm'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  const [
    { count: hotLeads },
    { count: activeProjects },
    { count: followups },
    { data: pipelineRows },
    { data: recentProspects },
  ] = await Promise.all([
    supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .gte('score', 80)
      .not('pipeline_stage', 'in', '("gagne","perdu")'),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'en_cours'),
    supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .not('next_followup_at', 'is', null)
      .lte('next_followup_at', new Date(Date.now() + 86_400_000).toISOString())
      .not('pipeline_stage', 'in', '("gagne","perdu")'),
    supabase
      .from('prospects')
      .select('valeur_estimee')
      .not('pipeline_stage', 'in', '("gagne","perdu")'),
    supabase
      .from('prospects')
      .select('id,entreprise,prenom,score,pipeline_stage,next_followup_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const pipeline = (pipelineRows ?? []).reduce(
    (sum: number, r: { valeur_estimee: number | null }) => sum + (r.valeur_estimee ?? 0),
    0
  )

  const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="Leads chauds" value={String(hotLeads ?? 0)} />
          <KpiCard label="Projets actifs" value={String(activeProjects ?? 0)} />
          <KpiCard label="Relances (24h)" value={String(followups ?? 0)} />
          <KpiCard label="Pipeline estimé" value={fmt.format(pipeline)} />
        </div>

        {/* Table derniers prospects */}
        <div>
          <div className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Derniers prospects
          </div>
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
                  const late = d < new Date()
                  return (
                    <span style={{ color: late ? '#FF453A' : 'rgba(255,255,255,0.6)' }}>
                      {d.toLocaleDateString('fr-FR')}
                    </span>
                  )
                },
              },
            ]}
            rows={(recentProspects ?? []) as Prospect[]}
            keyExtractor={(r: Prospect) => r.id}
            emptyMessage="Aucun prospect pour l'instant"
          />
        </div>

      </div>
    </div>
  )
}
