'use client'
import { useState, useTransition } from 'react'
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { updateProspectStage } from '@/lib/actions/prospects'
import { ProspectCard } from './ProspectCard'
import type { Prospect, PipelineStage } from '@/types/crm'

const COLUMNS: { stage: PipelineStage; label: string }[] = [
  { stage: 'nouveau',      label: 'Nouveau' },
  { stage: 'contacte',     label: 'Contacté' },
  { stage: 'devis_envoye', label: 'Devis envoyé' },
  { stage: 'negocia',      label: 'En négociation' },
  { stage: 'gagne',        label: 'Gagné' },
]

interface Toast { id: number; msg: string }

function DroppableColumn({
  stage,
  label,
  items,
}: {
  stage: PipelineStage
  label: string
  items: Prospect[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  return (
    <div
      ref={setNodeRef}
      className="flex flex-col gap-2 flex-shrink-0 w-[220px] rounded-[12px] p-3"
      style={{
        background: isOver ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isOver ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
        transition: 'background 0.15s, border 0.15s',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] uppercase tracking-[1.5px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {label}
        </span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[6px]" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
          {items.length}
        </span>
      </div>
      <SortableContext items={items.map(p => p.id)} strategy={verticalListSortingStrategy}>
        {items.map(p => <ProspectCard key={p.id} prospect={p} />)}
      </SortableContext>
      {items.length === 0 && (
        <div className="text-[10px] text-center py-4" style={{ color: 'rgba(255,255,255,0.12)' }}>Vide</div>
      )}
    </div>
  )
}

export function KanbanBoard({ initialProspects }: { initialProspects: Prospect[] }) {
  const [prospects, setProspects] = useState(initialProspects)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [lostOpen, setLostOpen] = useState(false)
  const [, start] = useTransition()

  function addToast(msg: string) {
    const id = Date.now()
    setToasts(t => [...t, { id, msg }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }

  function byStage(stage: PipelineStage) {
    return prospects.filter(p => p.pipeline_stage === stage)
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return

    const targetStage = (
      COLUMNS.find(c => c.stage === over.id)?.stage ??
      prospects.find(p => p.id === over.id)?.pipeline_stage
    ) as PipelineStage | undefined

    if (!targetStage) return
    const prospect = prospects.find(p => p.id === active.id)
    if (!prospect || prospect.pipeline_stage === targetStage) return

    const prev = prospects
    setProspects(ps =>
      ps.map(p => p.id === active.id ? { ...p, pipeline_stage: targetStage } : p)
    )

    start(async () => {
      try {
        await updateProspectStage(String(active.id), targetStage)
      } catch {
        setProspects(prev)
        addToast('Erreur — statut non mis à jour')
      }
    })
  }

  const activeProspect = activeId ? prospects.find(p => p.id === activeId) : null
  const lost = byStage('perdu')

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 flex-1 overflow-x-auto pb-2">
          {COLUMNS.map(col => (
            <DroppableColumn
              key={col.stage}
              stage={col.stage}
              label={col.label}
              items={byStage(col.stage)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeProspect && <ProspectCard prospect={activeProspect} />}
        </DragOverlay>
      </DndContext>

      {/* Colonne Perdu — accordéon */}
      <div
        className="rounded-[12px] overflow-hidden flex-shrink-0"
        style={{ border: '1px solid rgba(255,69,58,0.15)' }}
      >
        <button
          onClick={() => setLostOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-left"
          style={{ background: 'rgba(255,69,58,0.06)' }}
        >
          <span className="text-[9px] uppercase tracking-[1.5px] font-bold" style={{ color: 'rgba(255,69,58,0.7)' }}>
            Perdu
          </span>
          <span className="text-[9px]" style={{ color: 'rgba(255,69,58,0.5)' }}>
            {lost.length} {lostOpen ? '▲' : '▼'}
          </span>
        </button>
        {lostOpen && lost.length > 0 && (
          <div className="p-3 flex flex-wrap gap-2" style={{ background: 'rgba(255,69,58,0.03)' }}>
            {lost.map(p => (
              <div key={p.id} className="text-[10px] px-2.5 py-1 rounded-[8px]" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>
                {p.entreprise ?? p.prenom}
              </div>
            ))}
          </div>
        )}
        {lostOpen && lost.length === 0 && (
          <div className="px-4 py-3 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Aucun prospect perdu</div>
        )}
      </div>

      {/* Toasts */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className="px-4 py-2.5 rounded-[10px] text-[11px] font-semibold" style={{ background: '#FF453A', color: '#fff' }}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  )
}
