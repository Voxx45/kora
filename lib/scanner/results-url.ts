export interface FilterState {
  q: string
  type: string          // '' = tous les secteurs
  scorePreset: '' | 'high' | 'medium' | 'low'
  // high  → score_min=60
  // medium → score_min=40 & score_max=59
  // low   → score_max=39
  hasWebsite: '' | 'true' | 'false'
  nonPromotedOnly: boolean
  sort: 'score' | 'name' | 'city'
  order: 'asc' | 'desc'
  page: number          // 0-indexed
}

export const DEFAULT_FILTERS: FilterState = {
  q: '',
  type: '',
  scorePreset: '',
  hasWebsite: '',
  nonPromotedOnly: false,
  sort: 'score',
  order: 'desc',
  page: 0,
}

export const PAGE_SIZE = 50

export function buildResultsUrl(filters: FilterState): string {
  const params = new URLSearchParams()

  if (filters.q.trim())        params.set('q', filters.q.trim())
  if (filters.type)            params.set('type', filters.type)
  if (filters.hasWebsite)      params.set('has_website', filters.hasWebsite)
  if (filters.nonPromotedOnly)    params.set('promoted', 'false')

  if (filters.scorePreset === 'high') {
    params.set('score_min', '60')
  } else if (filters.scorePreset === 'medium') {
    params.set('score_min', '40')
    params.set('score_max', '59')
  } else if (filters.scorePreset === 'low') {
    params.set('score_max', '39')
  }

  params.set('sort', filters.sort)
  params.set('order', filters.order)
  params.set('offset', String(filters.page * PAGE_SIZE))
  params.set('limit', String(PAGE_SIZE))

  return `/api/scanner/results?${params.toString()}`
}
