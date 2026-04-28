import type { ProjectFormData, ProjectStatus } from '@/types/crm'

const VALID_STATUSES: ProjectStatus[] = ['en_cours','livre','facture']

export function validateProjectForm(data: unknown): data is ProjectFormData {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return (
    typeof d.client_nom === 'string' && d.client_nom.trim().length > 0 && d.client_nom.length <= 200 &&
    typeof d.service === 'string' && d.service.trim().length > 0 && d.service.length <= 200 &&
    typeof d.statut === 'string' && VALID_STATUSES.includes(d.statut as ProjectStatus)
  )
}
