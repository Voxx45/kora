import { createSupabaseServerClient } from '@/lib/supabase-server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { ProjetsClient } from './ProjetsClient'
import type { Project } from '@/types/crm'

export default async function ProjetsPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  const projects = (data ?? []) as Project[]

  const enCours  = projects.filter(p => p.statut === 'en_cours')
  const livres   = projects.filter(p => p.statut === 'livre')
  const factures = projects.filter(p => p.statut === 'facture')
  const totalEnCours = enCours.reduce((s, p) => s + (p.montant ?? 0), 0)
  const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total en cours', value: fmt.format(totalEnCours) },
            { label: 'En cours',       value: String(enCours.length) },
            { label: 'Livrés',         value: String(livres.length) },
            { label: 'Facturés',       value: String(factures.length) },
          ].map(k => (
            <div key={k.label} className="rounded-[12px] p-4 flex flex-col gap-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[9px] uppercase tracking-[1px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{k.label}</p>
              <p className="text-[18px] font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.85)' }}>{k.value}</p>
            </div>
          ))}
        </div>

        <ProjetsClient projects={projects} />
      </div>
    </div>
  )
}
