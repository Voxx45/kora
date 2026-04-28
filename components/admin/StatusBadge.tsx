import { cn } from '@/lib/utils'
import type { PipelineStage, ProjectStatus } from '@/types/crm'

const PIPELINE: Record<PipelineStage, { label: string; bg: string; color: string }> = {
  nouveau:      { label: '✦ Nouveau',   bg: 'rgba(0,122,255,0.12)',   color: '#0A84FF' },
  contacte:     { label: '⚡ Contacté', bg: 'rgba(255,159,10,0.12)',  color: '#FF9F0A' },
  devis_envoye: { label: '📄 Devis',    bg: 'rgba(90,200,250,0.12)',  color: '#5AC8FA' },
  negocia:      { label: '🤝 Négo.',    bg: 'rgba(191,90,242,0.12)',  color: '#BF5AF2' },
  gagne:        { label: '✓ Gagné',     bg: 'rgba(48,209,88,0.12)',   color: '#30D158' },
  perdu:        { label: '✗ Perdu',     bg: 'rgba(255,69,58,0.12)',   color: '#FF453A' },
}

const PROJECT: Record<ProjectStatus, { label: string; bg: string; color: string }> = {
  en_cours: { label: '⟳ En cours', bg: 'rgba(255,159,10,0.12)',  color: '#FF9F0A' },
  livre:    { label: '✓ Livré',    bg: 'rgba(48,209,88,0.12)',   color: '#30D158' },
  facture:  { label: '€ Facturé',  bg: 'rgba(0,122,255,0.12)',   color: '#0A84FF' },
}

const BASE = 'inline-flex items-center text-[10px] font-semibold px-2.5 py-0.5 rounded-[10px]'

export function PipelineBadge({ stage, className }: { stage: PipelineStage; className?: string }) {
  const s = PIPELINE[stage] ?? PIPELINE.nouveau
  return (
    <span className={cn(BASE, className)} style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

export function ProjectBadge({ statut, className }: { statut: ProjectStatus; className?: string }) {
  const s = PROJECT[statut] ?? PROJECT.en_cours
  return (
    <span className={cn(BASE, className)} style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}
