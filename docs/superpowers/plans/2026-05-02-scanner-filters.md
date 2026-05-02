# Scanner IA — Filtres, recherche, tri et pagination

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une barre de recherche, des filtres par secteur/score/site web, le tri par colonne et la pagination à la page Scanner IA, avec des requêtes serveur-side couvrant la totalité des résultats.

**Architecture:** L'état des filtres vit dans `ScannerResults` (React state). Un helper pur `buildResultsUrl` construit l'URL de fetch à partir de l'état. L'API `/api/scanner/results` est étendue avec des query params Supabase et retourne désormais `{ results, total }`. Un composant `ScannerResultsToolbar` gère l'affichage de la barre de filtres.

**Tech Stack:** Next.js 16 App Router, React, Supabase SSR, TypeScript, Jest, Tailwind CSS v4

---

## File Map

| Fichier | Action |
|---|---|
| `lib/scanner/results-url.ts` | **Créer** — helper pur `buildResultsUrl(filters)` |
| `__tests__/scanner-results-url.test.ts` | **Créer** — tests unitaires du helper |
| `app/api/scanner/results/route.ts` | **Modifier** — query params + réponse `{ results, total }` |
| `components/admin/ScannerResultsToolbar.tsx` | **Créer** — barre de filtres |
| `components/admin/ScannerResults.tsx` | **Modifier** — filter state, pagination, tri, nouveau shape API |

---

## Task 1 : Helper `buildResultsUrl` + tests

**Files:**
- Create: `lib/scanner/results-url.ts`
- Create: `__tests__/scanner-results-url.test.ts`

Ce helper est une fonction pure qui convertit un objet `FilterState` en URL de fetch. L'extraire permet de le tester sans React ni Supabase.

- [ ] **Step 1 : Créer le fichier de types/helper**

Crée `lib/scanner/results-url.ts` :

```ts
export interface FilterState {
  q: string
  type: string          // '' = tous les secteurs
  scorePreset: '' | 'high' | 'medium' | 'low'
  // high  → score_min=60
  // medium → score_min=40 & score_max=59
  // low   → score_max=39
  hasWebsite: '' | 'true' | 'false'
  promotedOnly: boolean
  sort: 'score' | 'name' | 'city'
  order: 'asc' | 'desc'
  page: number          // 0-indexed
}

export const DEFAULT_FILTERS: FilterState = {
  q: '',
  type: '',
  scorePreset: '',
  hasWebsite: '',
  promotedOnly: false,
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
  if (filters.promotedOnly)    params.set('promoted', 'false')

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
```

- [ ] **Step 2 : Écrire les tests (avant de les passer)**

Crée `__tests__/scanner-results-url.test.ts` :

```ts
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
```

- [ ] **Step 3 : Vérifier que les tests échouent**

```bash
cd /c/Users/pinea/Desktop/kora && npx jest __tests__/scanner-results-url.test.ts --no-coverage
```

Résultat attendu : `FAIL` — `Cannot find module '@/lib/scanner/results-url'`

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
npx jest __tests__/scanner-results-url.test.ts --no-coverage
```

Résultat attendu : `PASS` — 9 tests verts

- [ ] **Step 5 : Commit**

```bash
git add lib/scanner/results-url.ts __tests__/scanner-results-url.test.ts
git commit -m "feat(scanner): add buildResultsUrl helper + tests"
```

---

## Task 2 : Mettre à jour l'API `/api/scanner/results`

**Files:**
- Modify: `app/api/scanner/results/route.ts`

L'API reçoit les query params, construit la requête Supabase filtrée, et retourne `{ results: ScanResult[], total: number }`.

- [ ] **Step 1 : Remplacer le contenu de `app/api/scanner/results/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { ScanResult } from '@/types/scanner'

export const dynamic = 'force-dynamic'

export interface ScanResultsResponse {
  results: ScanResult[]
  total: number
}

export async function GET(req: NextRequest): Promise<NextResponse<ScanResultsResponse>> {
  const { searchParams } = req.nextUrl

  const q          = searchParams.get('q') ?? ''
  const type       = searchParams.get('type') ?? ''
  const scoreMin   = searchParams.get('score_min')
  const scoreMax   = searchParams.get('score_max')
  const hasWebsite = searchParams.get('has_website')  // 'true' | 'false' | null
  const promoted   = searchParams.get('promoted')     // 'false' | null
  const sort       = searchParams.get('sort') ?? 'score'
  const order      = searchParams.get('order') ?? 'desc'
  const offset     = parseInt(searchParams.get('offset') ?? '0', 10)
  const limit      = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

  const allowedSort = ['score', 'name', 'city']
  const safeSort = allowedSort.includes(sort) ? sort : 'score'
  const ascending = order === 'asc'

  const supabase = await createSupabaseServerClient()

  // Count query (no range)
  let countQuery = supabase
    .from('scan_results')
    .select('id', { count: 'exact', head: true })

  if (q)            countQuery = countQuery.or(`name.ilike.%${q}%,city.ilike.%${q}%`)
  if (type)         countQuery = countQuery.eq('place_type', type)
  if (scoreMin)     countQuery = countQuery.gte('score', parseInt(scoreMin, 10))
  if (scoreMax)     countQuery = countQuery.lte('score', parseInt(scoreMax, 10))
  if (hasWebsite !== null) countQuery = countQuery.eq('has_website', hasWebsite === 'true')
  if (promoted === 'false') countQuery = countQuery.eq('promoted', false)

  // Data query
  let dataQuery = supabase
    .from('scan_results')
    .select('*')
    .order(safeSort, { ascending })
    .range(offset, offset + limit - 1)

  if (q)            dataQuery = dataQuery.or(`name.ilike.%${q}%,city.ilike.%${q}%`)
  if (type)         dataQuery = dataQuery.eq('place_type', type)
  if (scoreMin)     dataQuery = dataQuery.gte('score', parseInt(scoreMin, 10))
  if (scoreMax)     dataQuery = dataQuery.lte('score', parseInt(scoreMax, 10))
  if (hasWebsite !== null) dataQuery = dataQuery.eq('has_website', hasWebsite === 'true')
  if (promoted === 'false') dataQuery = dataQuery.eq('promoted', false)

  const [{ count }, { data }] = await Promise.all([countQuery, dataQuery])

  return NextResponse.json({
    results: data ?? [],
    total: count ?? 0,
  })
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit --project /c/Users/pinea/Desktop/kora/tsconfig.json
```

Résultat attendu : aucune erreur

- [ ] **Step 3 : Commit**

```bash
git add app/api/scanner/results/route.ts
git commit -m "feat(scanner): extend results API with filter/sort/pagination query params"
```

---

## Task 3 : Créer `ScannerResultsToolbar`

**Files:**
- Create: `components/admin/ScannerResultsToolbar.tsx`

Composant pur (props in, callbacks out) — pas de state interne. Reçoit les filtres courants et des setters.

- [ ] **Step 1 : Créer `components/admin/ScannerResultsToolbar.tsx`**

```tsx
'use client'
import { PLACE_TYPES } from '@/lib/scanner/validation'
import type { FilterState } from '@/lib/scanner/results-url'

interface Props {
  filters: FilterState
  total: number
  onFilterChange: (patch: Partial<FilterState>) => void
  onReset: () => void
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 12,
  padding: '6px 10px',
  outline: 'none',
}

const isActive = (f: FilterState) =>
  !!f.q || !!f.type || !!f.scorePreset || !!f.hasWebsite || f.promotedOnly

export function ScannerResultsToolbar({ filters, total, onFilterChange, onReset }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.015)',
        flexWrap: 'wrap',
      }}
    >
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.3)', fontSize: 11, pointerEvents: 'none',
        }}>
          🔍
        </span>
        <input
          value={filters.q}
          onChange={e => onFilterChange({ q: e.target.value, page: 0 })}
          placeholder="Rechercher…"
          style={{ ...inputStyle, paddingLeft: 26, width: 200 }}
        />
      </div>

      {/* Secteur */}
      <select
        value={filters.type}
        onChange={e => onFilterChange({ type: e.target.value, page: 0 })}
        style={inputStyle}
      >
        <option value="">Tous les secteurs</option>
        {PLACE_TYPES.map(t => (
          <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
        ))}
      </select>

      {/* Score */}
      <select
        value={filters.scorePreset}
        onChange={e => onFilterChange({ scorePreset: e.target.value as FilterState['scorePreset'], page: 0 })}
        style={inputStyle}
      >
        <option value="">Tous les scores</option>
        <option value="high">Fort potentiel (≥ 60)</option>
        <option value="medium">Potentiel moyen (40–59)</option>
        <option value="low">Faible (&lt; 40)</option>
      </select>

      {/* Site web */}
      <select
        value={filters.hasWebsite}
        onChange={e => onFilterChange({ hasWebsite: e.target.value as FilterState['hasWebsite'], page: 0 })}
        style={inputStyle}
      >
        <option value="">Tous (site web)</option>
        <option value="false">Sans site</option>
        <option value="true">Avec site</option>
      </select>

      {/* Non promus toggle */}
      <button
        onClick={() => onFilterChange({ promotedOnly: !filters.promotedOnly, page: 0 })}
        style={{
          ...inputStyle,
          cursor: 'pointer',
          background: filters.promotedOnly ? 'rgba(0,122,255,0.2)' : 'rgba(255,255,255,0.06)',
          border: filters.promotedOnly ? '1px solid rgba(0,122,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
          color: filters.promotedOnly ? '#007AFF' : 'rgba(255,255,255,0.6)',
          fontWeight: filters.promotedOnly ? 600 : 400,
        }}
      >
        Non promus seulement
      </button>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {isActive(filters) && (
          <button
            onClick={onReset}
            style={{
              fontSize: 11, color: 'rgba(255,255,255,0.4)',
              background: 'none', border: 'none', cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Tout effacer
          </button>
        )}
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#fff', fontWeight: 600 }}>{total.toLocaleString('fr-FR')}</span> résultat{total > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit --project /c/Users/pinea/Desktop/kora/tsconfig.json
```

Résultat attendu : aucune erreur

- [ ] **Step 3 : Commit**

```bash
git add components/admin/ScannerResultsToolbar.tsx
git commit -m "feat(scanner): add ScannerResultsToolbar component"
```

---

## Task 4 : Refondre `ScannerResults` — état, tri, pagination, toolbar

**Files:**
- Modify: `components/admin/ScannerResults.tsx`

C'est la pièce centrale : on câble le `FilterState`, le debounce, le fetch vers la nouvelle API, les en-têtes triables et la pagination.

- [ ] **Step 1 : Remplacer entièrement `components/admin/ScannerResults.tsx`**

```tsx
'use client'
import { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { ScannerResultsToolbar } from '@/components/admin/ScannerResultsToolbar'
import { promoteToCRM } from '@/lib/actions/scanner'
import { useDrawer } from '@/lib/contexts/drawer-context'
import {
  buildResultsUrl,
  DEFAULT_FILTERS,
  PAGE_SIZE,
  type FilterState,
} from '@/lib/scanner/results-url'
import type { ScanResult } from '@/types/scanner'
import type { ScanResultsResponse } from '@/app/api/scanner/results/route'

interface ScannerResultsProps {
  initialResults: ScanResult[]
  refreshKey: number
}

type SortKey = 'score' | 'name' | 'city'

export function ScannerResults({ initialResults, refreshKey }: ScannerResultsProps) {
  const [results, setResults] = useState<ScanResult[]>(initialResults)
  const [total, setTotal] = useState(initialResults.length)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [isPending, startTransition] = useTransition()
  const { openDrawer } = useDrawer()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstMount = useRef(true)

  // ── Fetch ────────────────────────────────────────────────
  const fetchResults = useCallback(async (f: FilterState) => {
    const res = await fetch(buildResultsUrl(f))
    if (!res.ok) return
    const data: ScanResultsResponse = await res.json()
    setResults(data.results)
    setTotal(data.total)
  }, [])

  // ── Filter changes (non-q) ────────────────────────────────
  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return }
    fetchResults(filters)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.scorePreset, filters.hasWebsite, filters.promotedOnly,
      filters.sort, filters.order, filters.page])

  // ── q debounce ───────────────────────────────────────────
  useEffect(() => {
    if (isFirstMount.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(filters), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q])

  // ── Refresh from scanner tick ────────────────────────────
  useEffect(() => {
    if (refreshKey > 0) fetchResults(filters)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  // ── Helpers ──────────────────────────────────────────────
  function patchFilters(patch: Partial<FilterState>) {
    setFilters(prev => ({ ...prev, ...patch }))
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
  }

  function toggleSort(key: SortKey) {
    setFilters(prev => {
      if (prev.sort !== key) return { ...prev, sort: key, order: 'asc', page: 0 }
      if (prev.order === 'asc') return { ...prev, order: 'desc', page: 0 }
      // Already desc → back to default
      return { ...prev, sort: 'score', order: 'desc', page: 0 }
    })
  }

  async function handlePromote(result: ScanResult) {
    setResults(prev => prev.map(r => r.id === result.id ? { ...r, promoted: true } : r))
    startTransition(async () => {
      try {
        await promoteToCRM(result.id)
      } catch {
        setResults(prev => prev.map(r => r.id === result.id ? { ...r, promoted: false } : r))
      }
    })
  }

  // ── Sort indicator ───────────────────────────────────────
  function sortArrow(key: SortKey) {
    if (filters.sort !== key) return null
    return (
      <span style={{ marginLeft: 4, color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
        {filters.order === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScannerResultsToolbar
        filters={filters}
        total={total}
        onFilterChange={patchFilters}
        onReset={resetFilters}
      />

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Sortable: Entreprise */}
              <th
                className="text-left px-4 py-2 cursor-pointer select-none"
                style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}
                onClick={() => toggleSort('name')}
              >
                Entreprise{sortArrow('name')}
              </th>
              {/* Sortable: Ville */}
              <th
                className="text-left px-4 py-2 cursor-pointer select-none"
                style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}
                onClick={() => toggleSort('city')}
              >
                Ville{sortArrow('city')}
              </th>
              {/* Static */}
              <th className="text-left px-4 py-2" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>
                Secteur
              </th>
              <th className="text-left px-4 py-2" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>
                Site
              </th>
              {/* Sortable: Score */}
              <th
                className="text-left px-4 py-2 cursor-pointer select-none"
                style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}
                onClick={() => toggleSort('score')}
              >
                Score{sortArrow('score')}
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {results.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                  Aucun résultat pour ces filtres.
                </td>
              </tr>
            )}
            {results.map(result => (
              <tr
                key={result.id}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  opacity: result.promoted ? 0.55 : 1,
                }}
                className="hover:bg-white/[0.02]"
              >
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => openDrawer({ type: 'scan_result', data: result })}
                    className="hover:underline text-left"
                    style={{ color: '#fff', fontWeight: 500, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {result.name}
                  </button>
                </td>
                <td className="px-4 py-2.5" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                  {result.city}
                </td>
                <td className="px-4 py-2.5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                  {result.place_type.replace(/_/g, ' ')}
                </td>
                <td className="px-4 py-2.5">
                  {result.website ? (
                    <a
                      href={result.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ color: '#007AFF', fontSize: 11 }}
                      className="hover:underline"
                    >
                      {new URL(result.website).hostname}
                    </a>
                  ) : (
                    <span style={{ color: 'rgba(255,59,48,0.8)', fontSize: 11 }}>Aucun site</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <ScoreBadge score={result.score} />
                </td>
                <td className="px-4 py-2.5">
                  {result.promoted ? (
                    <span style={{ color: '#34C759', fontSize: 11, fontWeight: 600 }}>✓ CRM</span>
                  ) : (
                    <button
                      onClick={() => handlePromote(result)}
                      disabled={isPending}
                      style={{
                        background: '#007AFF', color: '#fff', border: 'none',
                        padding: '3px 10px', borderRadius: 5, fontSize: 11,
                        fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      + CRM
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 16, padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => patchFilters({ page: filters.page - 1 })}
            disabled={filters.page === 0}
            style={{
              fontSize: 12, color: filters.page === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
              background: 'none', border: 'none', cursor: filters.page === 0 ? 'default' : 'pointer',
            }}
          >
            ← Précédent
          </button>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            Page <span style={{ color: '#fff', fontWeight: 600 }}>{filters.page + 1}</span> sur {totalPages}
          </span>
          <button
            onClick={() => patchFilters({ page: filters.page + 1 })}
            disabled={filters.page >= totalPages - 1}
            style={{
              fontSize: 12, color: filters.page >= totalPages - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
              background: 'none', border: 'none', cursor: filters.page >= totalPages - 1 ? 'default' : 'pointer',
            }}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit --project /c/Users/pinea/Desktop/kora/tsconfig.json
```

Résultat attendu : aucune erreur

- [ ] **Step 3 : Vérifier les tests existants**

```bash
npx jest --no-coverage
```

Résultat attendu : tous les tests passent (dont les 9 nouveaux de Task 1)

- [ ] **Step 4 : Commit final**

```bash
git add components/admin/ScannerResults.tsx
git commit -m "feat(scanner): wire filters, sort, pagination into ScannerResults"
```

---

## Task 5 : Mettre à jour `ScannerPageClient` pour la réponse initiale

**Files:**
- Modify: `app/(admin)/scanner/page.tsx`
- Modify: `app/(admin)/scanner/ScannerPageClient.tsx`

Le server component charge maintenant le total initial depuis Supabase pour un premier rendu sans flash.

- [ ] **Step 1 : Mettre à jour `app/(admin)/scanner/page.tsx`**

Remplacer la requête de résultats par :

```ts
const [{ data: statusData }, { data: resultsData, count }] = await Promise.all([
  supabase.from('scan_status').select('*').eq('id', 1).single(),
  supabase
    .from('scan_results')
    .select('*', { count: 'exact' })
    .order('score', { ascending: false })
    .range(0, 49),
])
```

Et passer `initialTotal` au client :

```tsx
<ScannerPageClient
  initialStatus={status}
  initialResults={results}
  initialTotal={count ?? results.length}
/>
```

- [ ] **Step 2 : Mettre à jour `ScannerPageClient.tsx`**

Ajouter `initialTotal` dans les props et le transmettre à `ScannerResults` :

```tsx
interface ScannerPageClientProps {
  initialStatus: ScanStatus
  initialResults: ScanResult[]
  initialTotal: number
}

export function ScannerPageClient({ initialStatus, initialResults, initialTotal }: ScannerPageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  function handleTickComplete(newResults: number) {
    if (newResults > 0) setRefreshKey(k => k + 1)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <ScannerSidebar
        initialStatus={initialStatus}
        onTickComplete={handleTickComplete}
      />
      <ScannerResults
        initialResults={initialResults}
        initialTotal={initialTotal}
        refreshKey={refreshKey}
      />
    </div>
  )
}
```

- [ ] **Step 3 : Mettre à jour la signature de `ScannerResults`**

Dans `components/admin/ScannerResults.tsx`, ajouter `initialTotal` :

```tsx
interface ScannerResultsProps {
  initialResults: ScanResult[]
  initialTotal: number
  refreshKey: number
}

export function ScannerResults({ initialResults, initialTotal, refreshKey }: ScannerResultsProps) {
  const [results, setResults] = useState<ScanResult[]>(initialResults)
  const [total, setTotal] = useState(initialTotal)   // ← was initialResults.length
  // … reste identique
```

- [ ] **Step 4 : Vérifier TypeScript + tests**

```bash
npx tsc --noEmit --project /c/Users/pinea/Desktop/kora/tsconfig.json && npx jest --no-coverage
```

Résultat attendu : aucune erreur TS, tous les tests passent

- [ ] **Step 5 : Commit final**

```bash
git add app/\(admin\)/scanner/page.tsx app/\(admin\)/scanner/ScannerPageClient.tsx components/admin/ScannerResults.tsx
git commit -m "feat(scanner): pass initialTotal from server for accurate count on first render"
```
