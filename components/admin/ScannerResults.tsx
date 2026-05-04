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
  initialTotal: number
  refreshKey: number
}

type SortKey = 'score' | 'name' | 'city'

export function ScannerResults({ initialResults, initialTotal, refreshKey }: ScannerResultsProps) {
  const [results, setResults] = useState<ScanResult[]>(initialResults)
  const [total, setTotal] = useState(initialTotal)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [isPending, startTransition] = useTransition()
  const { openDrawer } = useDrawer()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstMount = useRef(true)
  const isFirstQ = useRef(true)

  const fetchResults = useCallback(async (f: FilterState) => {
    const res = await fetch(buildResultsUrl(f))
    if (!res.ok) return
    const data: ScanResultsResponse = await res.json()
    setResults(data.results)
    setTotal(data.total)
  }, [])

  // Non-q filter changes → immediate fetch, reset page
  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return }
    fetchResults(filters)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.scorePreset, filters.hasWebsite, filters.nonPromotedOnly,
      filters.sort, filters.order, filters.page])

  // q → debounce 300ms
  useEffect(() => {
    if (isFirstQ.current) { isFirstQ.current = false; return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(filters), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q])

  // Refresh signal from scanner tick
  useEffect(() => {
    if (refreshKey > 0) fetchResults(filters)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

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

  function sortArrow(key: SortKey) {
    if (filters.sort !== key) return null
    return (
      <span style={{ marginLeft: 4, color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
        {filters.order === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

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
              <th
                className="text-left px-4 py-2 cursor-pointer select-none"
                style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}
                onClick={() => toggleSort('name')}
              >
                Entreprise{sortArrow('name')}
              </th>
              <th
                className="text-left px-4 py-2 cursor-pointer select-none"
                style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}
                onClick={() => toggleSort('city')}
              >
                Ville{sortArrow('city')}
              </th>
              <th className="text-left px-4 py-2" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>
                Secteur
              </th>
              <th className="text-left px-4 py-2" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>
                Site
              </th>
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
              fontSize: 12,
              color: filters.page === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
              background: 'none', border: 'none',
              cursor: filters.page === 0 ? 'default' : 'pointer',
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
              fontSize: 12,
              color: filters.page >= totalPages - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
              background: 'none', border: 'none',
              cursor: filters.page >= totalPages - 1 ? 'default' : 'pointer',
            }}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  )
}
