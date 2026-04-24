// Statuts lead
export type LeadStatus = 'new' | 'contacted' | 'not_interested' | 'converted'
export type PipelineColumn = 'to_contact' | 'contacted' | 'in_discussion' | 'converted'
export type EmailLanguage = 'fr' | 'en'

// Score breakdown
export interface ScoreBreakdown {
  no_website: number
  no_https: number
  pagespeed_mobile: number
  no_viewport_meta: number
  old_site: number
  incomplete_gmb: number
  claude_adjustment: number
}

// Entreprise prospect
export interface Business {
  id: string
  scan_id: string | null
  google_place_id: string | null
  name: string
  category: string | null
  address: string | null
  phone: string | null
  website: string | null
  email: string | null
  google_maps_url: string | null
  has_website: boolean
  opportunity_score: number
  score_breakdown: ScoreBreakdown
  lead_status: LeadStatus
  in_pipeline: boolean
  pipeline_column: PipelineColumn
  kanban_order: number
  follow_up_date: string | null
  estimated_value: number | null
  notes: string | null
  claude_analysis: string | null
  scrape_status: string | null
  created_at: string
  updated_at: string | null
}

// Scan
export interface Scan {
  id: string
  city: string
  category: string | null
  status: 'running' | 'completed' | 'error'
  results_count: number
  created_at: string
}

// Email généré
export interface GeneratedEmail {
  subject: string
  subject_alt?: string
  body: string
}

export interface Email {
  id: string
  business_id: string
  subject: string
  body: string
  language: EmailLanguage
  sent_at: string | null
  created_at: string
}

// Paramètres utilisateur
export interface UserProfile {
  id: number
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  activity: string | null
  email_signature: string | null
  default_language: EmailLanguage
  updated_at: string | null
}

// Activité CRM
export type ActivityType =
  | 'email_generated'
  | 'email_sent'
  | 'status_changed'
  | 'note_added'
  | 'call'
  | 'meeting'
  | 'follow_up_set'
  | 'pipeline_added'

export interface Activity {
  id: string
  business_id: string
  type: ActivityType
  content: string | null
  created_at: string
}
