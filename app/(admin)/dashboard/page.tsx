import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { KpiCard } from '@/components/admin/KpiCard'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'

interface MockLead { id: string; name: string; score: string; status: string; relance: string }

const MOCK_LEADS: MockLead[] = [
  { id: '1', name: '🍕 Pizzeria Napoli', score: '94/100', status: 'hot',  relance: "Aujourd'hui" },
  { id: '2', name: '🔧 Plombier Dupont', score: '81/100', status: 'warm', relance: 'Demain' },
  { id: '3', name: '✂ Salon L\'Élégance', score: '76/100', status: 'new', relance: 'Lundi' },
]

const COLUMNS: DataTableColumn<MockLead>[] = [
  { key: 'name', label: 'Entreprise', width: '2fr', render: r => <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{r.name}</span> },
  { key: 'score', label: 'Score', width: '0.8fr' },
  {
    key: 'status', label: 'Statut', width: '1fr',
    render: r => (
      <Badge variant={r.status as 'hot' | 'warm' | 'new'}>
        {r.status === 'hot' ? '🔥 Chaud' : r.status === 'warm' ? '⚡ Contacté' : '✦ Nouveau'}
      </Badge>
    ),
  },
  { key: 'relance', label: 'Relance', width: '1fr' },
]

export default function DashboardPage() {
  return (
    <>
      <AdminTopbar
        actions={
          <Button variant="secondary" size="sm" className="text-white/70 border-white/10 bg-white/[0.07] hover:bg-white/10">
            + Nouveau scan
          </Button>
        }
      />
      <main className="flex-1 p-5 overflow-y-auto">
        <h1 className="text-[16px] font-bold text-white mb-4">Tableau de bord</h1>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <KpiCard value="24" label="Leads chauds"       delta="↑ +6 cette semaine" deltaVariant="up" />
          <KpiCard value="3"  label="Projets actifs"     delta="2 en attente"        deltaVariant="warning" />
          <KpiCard value="7"  label="Relances"           delta="⚠ Priorité"          deltaVariant="alert" />
          <KpiCard value="2 400 €" label="Pipeline estimé" delta="↑ ce mois"         deltaVariant="up" />
        </div>

        {/* Table */}
        <DataTable
          columns={COLUMNS}
          rows={MOCK_LEADS}
          keyExtractor={r => r.id}
          emptyMessage="Aucun prospect pour le moment"
        />
      </main>
    </>
  )
}
