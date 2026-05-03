import { buildResultsUrl, DEFAULT_FILTERS, PAGE_SIZE } from '@/lib/scanner/results-url'

describe('buildResultsUrl', () => {
  it('produit une URL minimale avec les defaults', () => {
    const url = buildResultsUrl(DEFAULT_FILTERS)
    expect(url).toContain('/api/scanner/results')
    expect(url).toContain('sort=score')
    expect(url).toContain('order=desc')
    expect(url).toContain('offset=0')
    expect(url).toContain(`limit=${PAGE_SIZE}`)
    expect(url).not.toContain('q=')
    expect(url).not.toContain('type=')
  })

  it('inclut q quand renseigné', () => {
    const url = buildResultsUrl({ ...DEFAULT_FILTERS, q: 'coiffeur' })
    expect(url).toContain('q=coiffeur')
  })

  it('trim le q', () => {
    const url = buildResultsUrl({ ...DEFAULT_FILTERS, q: '  Lyon  ' })
    expect(url).toContain('q=Lyon')
    expect(url).not.toContain('q=+')
  })

  it('scorePreset high → score_min=60, pas de score_max', () => {
    const url = buildResultsUrl({ ...DEFAULT_FILTERS, scorePreset: 'high' })
    expect(url).toContain('score_min=60')
    expect(url).not.toContain('score_max')
  })

  it('scorePreset medium → score_min=40 et score_max=59', () => {
    const url = buildResultsUrl({ ...DEFAULT_FILTERS, scorePreset: 'medium' })
    expect(url).toContain('score_min=40')
    expect(url).toContain('score_max=59')
  })

  it('scorePreset low → score_max=39, pas de score_min', () => {
    const url = buildResultsUrl({ ...DEFAULT_FILTERS, scorePreset: 'low' })
    expect(url).toContain('score_max=39')
    expect(url).not.toContain('score_min')
  })

  it('promotedOnly → promoted=false (afficher uniquement non promus)', () => {
    const url = buildResultsUrl({ ...DEFAULT_FILTERS, promotedOnly: true })
    expect(url).toContain('promoted=false')
  })

  it('page 2 → offset=100', () => {
    const url = buildResultsUrl({ ...DEFAULT_FILTERS, page: 2 })
    expect(url).toContain(`offset=${PAGE_SIZE * 2}`)
  })

  it('hasWebsite=false → has_website=false', () => {
    const url = buildResultsUrl({ ...DEFAULT_FILTERS, hasWebsite: 'false' })
    expect(url).toContain('has_website=false')
  })

  it('tri par name asc', () => {
    const url = buildResultsUrl({ ...DEFAULT_FILTERS, sort: 'name', order: 'asc' })
    expect(url).toContain('sort=name')
    expect(url).toContain('order=asc')
  })
})
