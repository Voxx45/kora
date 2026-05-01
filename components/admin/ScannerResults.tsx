// components/admin/ScannerResults.tsx
'use client'
import { useState, useEffect, useTransition } from 'react'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { promoteToCRM } from '@/lib/actions/scanner'
import { useDrawer } from '@/lib/contexts/drawer-context'
import type { ScanResult } from '@/types/scanner'

interface ScannerResultsProps {
  initialResults: ScanResult[]
  refreshKey: number
}

export function ScannerResults({ initialResults, refreshKey }: ScannerResultsProps) {
  const [results, setResults] = useState<ScanResult[]>(initialResults)
  const [isPending, startTransition] = useTransition()
  const { openDrawer } = useDrawer()

  async function refresh() {
    const res = await fetch('/api/scanner/results')
    if (res.ok) {
      const data: ScanResult[] = await res.json()
      setResults(data)
    }
  }

  // Re-fetch when parent signals a tick completed with new results
  useEffect(() => {
    if (refreshKey > 0) refresh()
  }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePromote(result: ScanResult) {
    // Optimistic update
    setResults(prev =>
      prev.map(r => r.id === result.id ? { ...r, promoted: true } : r)
    )
    startTransition(async () => {
      try {
        await promoteToCRM(result.id)
      } catch {
        // Rollback on error
        setResults(prev =>
          prev.map(r => r.id === result.id ? { ...r, promoted: false } : r)
        )
      }
    })
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Entreprise', 'Ville', 'Secteur', 'Site', 'Score', ''].map(h => (
              <th
                key={h}
                className="text-left px-4 py-2"
                style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                Aucun résultat — lance un scan pour commencer.
              </td>
            </tr>
          )}
          {results.map(result => (
            <tr
              key={result.id}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
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
  )
}
