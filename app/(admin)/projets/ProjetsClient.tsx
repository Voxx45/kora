'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProject } from '@/lib/actions/projects'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { ProjectBadge } from '@/components/admin/StatusBadge'
import { DataTable } from '@/components/admin/DataTable'
import type { Project } from '@/types/crm'

export function ProjetsClient({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [, start] = useTransition()

  const now = new Date()

  function handleDelete(id: string) {
    if (!confirm('Supprimer ce projet ?')) return
    start(async () => { await deleteProject(id); router.refresh() })
  }

  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={() => { setEditing(null); setFormOpen(true) }}
          className="px-3 py-1.5 rounded-[10px] text-[11px] font-semibold"
          style={{ background: 'linear-gradient(135deg,#FCD34D,#F97316)', color: '#000' }}
        >
          ＋ Nouveau projet
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucun projet — commencez par en ajouter un</p>
        </div>
      ) : (
        <DataTable<Project>
          columns={[
            { key: 'client_nom', label: 'Client',   width: '2fr' },
            { key: 'service',    label: 'Service',  width: '2fr' },
            { key: 'montant',    label: 'Montant',  render: (r: Project) => r.montant != null ? `${r.montant} €` : '—' },
            { key: 'statut',     label: 'Statut',   render: (r: Project) => <ProjectBadge statut={r.statut} /> },
            {
              key: 'deadline',
              label: 'Deadline',
              render: (r: Project) => {
                if (!r.deadline) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                const d = new Date(r.deadline)
                return <span style={{ color: d < now ? '#FF453A' : 'rgba(255,255,255,0.6)' }}>{d.toLocaleDateString('fr-FR')}</span>
              },
            },
            {
              key: 'actions',
              label: '',
              width: '80px',
              render: (r: Project) => (
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(r); setFormOpen(true) }} className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>✏</button>
                  <button onClick={() => handleDelete(r.id)} className="text-[11px]" style={{ color: 'rgba(255,69,58,0.6)' }}>✕</button>
                </div>
              ),
            },
          ]}
          rows={projects}
          keyExtractor={(r: Project) => r.id}
        />
      )}

      {formOpen && (
        <ProjectForm
          project={editing ?? undefined}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); router.refresh() }}
        />
      )}
    </>
  )
}
