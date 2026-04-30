// types/scanner.ts

export type ScanQueueStatus = 'pending' | 'running' | 'done' | 'error'

export interface ScanQueueItem {
  id: string
  city: string
  place_type: string
  status: ScanQueueStatus
  error_msg: string | null
  created_at: string
  updated_at: string
}

export interface ScanResult {
  id: string
  place_id: string
  name: string
  city: string
  place_type: string
  score: number
  website: string | null
  phone: string | null
  address: string | null
  gmb_rating: number | null
  gmb_reviews: number | null
  has_website: boolean
  has_https: boolean
  promoted: boolean
  promoted_at: string | null
  scanned_at: string
}

export interface ScanStatus {
  id: number
  is_scanning: boolean
  current_city: string | null
  current_type: string | null
  total_scanned: number
  total_results: number
  last_error: string | null
  updated_at: string
}

export interface ScanTickResponse {
  done: boolean
  city?: string
  type?: string
  newResults?: number
  error?: string
}

export interface ScanManualResponse {
  newResults: number
  error?: string
}

/** Input to calculateScanScore — built from Places + scraper + pagespeed data */
export interface ScannerScorerInput {
  has_website: boolean
  website_url: string | null
  has_https: boolean
  pagespeed_mobile: number | null
  has_viewport_meta: boolean | null
  site_age_signal: 'old' | 'recent' | 'unknown' | null
  has_complete_gmb: boolean
}

/** Raw result from Google Places before scoring */
export interface PlaceScanResult {
  place_id: string
  name: string
  address: string
  phone: string | null
  website: string | null
  gmb_rating: number | null
  gmb_reviews: number | null
  has_complete_gmb: boolean
}
