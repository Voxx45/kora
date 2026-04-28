import type { PipelineStage, ProspectFormData } from '@/types/crm'

const VALID_STAGES: PipelineStage[] = [
  'nouveau', 'contacte', 'devis_envoye', 'negocia', 'gagne', 'perdu',
]

export function validatePipelineStage(stage: unknown): stage is PipelineStage {
  return typeof stage === 'string' && VALID_STAGES.includes(stage as PipelineStage)
}

export function validateProspectForm(data: unknown): data is ProspectFormData {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return (
    typeof d.prenom === 'string' && d.prenom.trim().length > 0 && d.prenom.length <= 100 &&
    typeof d.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) && d.email.length <= 254 &&
    typeof d.score === 'number' && d.score >= 0 && d.score <= 100 &&
    validatePipelineStage(d.pipeline_stage)
  )
}
