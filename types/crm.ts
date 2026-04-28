export type PipelineStage = 'nouveau' | 'contacte' | 'devis_envoye' | 'negocia' | 'gagne' | 'perdu'
export type ProspectSource = 'contact_form' | 'manual' | 'scanner'
export type ProjectStatus  = 'en_cours' | 'livre' | 'facture'

export interface Prospect {
  id: string
  created_at: string
  source: ProspectSource
  prenom: string
  email: string
  telephone: string | null
  entreprise: string | null
  service_interesse: string | null
  message: string | null
  score: number
  pipeline_stage: PipelineStage
  valeur_estimee: number | null
  next_followup_at: string | null
  notes: string | null
  updated_at: string
}

export interface Project {
  id: string
  created_at: string
  prospect_id: string | null
  client_nom: string
  service: string
  montant: number | null
  statut: ProjectStatus
  deadline: string | null
  notes: string | null
  updated_at: string
}

export interface GlobalNote {
  id: string
  content: string
  created_at: string
  updated_at: string
}

export interface ProspectFormData {
  id?: string
  prenom: string
  email: string
  telephone?: string
  entreprise?: string
  service_interesse?: string
  message?: string
  score: number
  pipeline_stage: PipelineStage
  valeur_estimee?: number
  next_followup_at?: string
  notes?: string
}

export interface ProjectFormData {
  id?: string
  prospect_id?: string
  client_nom: string
  service: string
  montant?: number
  statut: ProjectStatus
  deadline?: string
  notes?: string
}
