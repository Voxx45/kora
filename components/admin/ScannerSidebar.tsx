// components/admin/ScannerSidebar.tsx
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { PLACE_TYPES } from '@/lib/scanner/validation'
import type { ScanStatus, ScanTickResponse } from '@/types/scanner'

interface ScannerSidebarProps {
  initialStatus: ScanStatus
  onTickComplete: (newResults: number) => void
}

export function ScannerSidebar({ initialStatus, onTickComplete }: ScannerSidebarProps) {
  const [status, setStatus] = useState<ScanStatus>(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const [manualCity, setManualCity] = useState('')
  const [manualType, setManualType] = useState(PLACE_TYPES[0])
  const [manualLoading, setManualLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isRunningRef = useRef(status.is_scanning)

  const tick = useCallback(async () => {
    if (!isRunningRef.current) return

    try {
      const res = await fetch('/api/scanner/tick', { method: 'POST' })
      const data: ScanTickResponse = await res.json()

      if (data.done) {
        isRunningRef.current = false
        setStatus(s => ({ ...s, is_scanning: false }))
        return
      }

      if (data.newResults !== undefined) {
        onTickComplete(data.newResults)
        setStatus(s => ({
          ...s,
          total_scanned: s.total_scanned + 1,
          total_results: s.total_results + (data.newResults ?? 0),
          current_city: data.city ?? s.current_city,
          current_type: data.type ?? s.current_type,
        }))
      }
    } catch {
      // Network error — keep trying
    }

    if (isRunningRef.current) {
      intervalRef.current = setTimeout(tick, 2000)
    }
  }, [onTickComplete])

  useEffect(() => {
    if (status.is_scanning) {
      isRunningRef.current = true
      intervalRef.current = setTimeout(tick, 500)
    }
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStart() {
    setIsLoading(true)
    await fetch('/api/scanner/start', { method: 'POST' })
    isRunningRef.current = true
    setStatus(s => ({ ...s, is_scanning: true, last_error: null }))
    intervalRef.current = setTimeout(tick, 500)
    setIsLoading(false)
  }

  async function handleStop() {
    setIsLoading(true)
    isRunningRef.current = false
    if (intervalRef.current) clearTimeout(intervalRef.current)
    await fetch('/api/scanner/stop', { method: 'POST' })
    setStatus(s => ({ ...s, is_scanning: false }))
    setIsLoading(false)
  }

  async function handleManual() {
    if (!manualCity.trim()) return
    setManualLoading(true)
    const res = await fetch('/api/scanner/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: manualCity.trim(), place_type: manualType }),
    })
    const data = await res.json()
    if (data.newResults > 0) onTickComplete(data.newResults)
    setManualLoading(false)
  }

  const dotColor = status.is_scanning
    ? '#34C759'
    : status.last_error
      ? '#FF3B30'
      : 'rgba(255,255,255,0.3)'

  const statusLabel = status.is_scanning
    ? 'En cours'
    : status.last_error
      ? 'Erreur — rate limit'
      : 'Arrêté'

  return (
    <aside
      className="flex-shrink-0 flex flex-col gap-3 p-4"
      style={{ width: 220, borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Status */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', marginBottom: 6 }}>Statut</div>
        <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
          <span
            style={{
              width: 8, height: 8, borderRadius: '50%', background: dotColor,
              boxShadow: status.is_scanning ? `0 0 6px ${dotColor}` : 'none',
              display: 'inline-block',
            }}
          />
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{statusLabel}</span>
        </div>
        {status.is_scanning ? (
          <button
            onClick={handleStop}
            disabled={isLoading}
            className="w-full text-xs font-semibold py-1.5 rounded"
            style={{ background: '#FF3B30', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            ⏹ Arrêter
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="w-full text-xs font-semibold py-1.5 rounded"
            style={{ background: '#34C759', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            ▶ Démarrer
          </button>
        )}
      </div>

      {/* KPIs */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', marginBottom: 8 }}>Progression</div>
        {status.is_scanning && status.current_city && (
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginBottom: 6 }}>
            {status.current_city} → {status.current_type?.replace(/_/g, ' ')}
          </div>
        )}
        <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
          {status.total_scanned.toLocaleString('fr-FR')}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: 10 }}> scannés</span>
        </div>
        <div style={{ color: '#34C759', fontSize: 13, fontWeight: 600 }}>
          {status.total_results.toLocaleString('fr-FR')}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: 10 }}> résultats</span>
        </div>
      </div>

      {/* Manual scan */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', marginBottom: 8 }}>Scan manuel</div>
        <input
          value={manualCity}
          onChange={e => setManualCity(e.target.value)}
          placeholder="Ville…"
          className="w-full text-xs rounded mb-2 px-2 py-1.5"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
        />
        <select
          value={manualType}
          onChange={e => setManualType(e.target.value)}
          className="w-full text-xs rounded mb-2 px-2 py-1.5"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
        >
          {PLACE_TYPES.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button
          onClick={handleManual}
          disabled={manualLoading || !manualCity.trim()}
          className="w-full text-xs font-semibold py-1.5 rounded"
          style={{
            background: manualCity.trim() ? '#007AFF' : 'rgba(255,255,255,0.1)',
            color: '#fff', border: 'none', cursor: manualCity.trim() ? 'pointer' : 'default',
          }}
        >
          {manualLoading ? 'Scan…' : 'Lancer'}
        </button>
      </div>
    </aside>
  )
}
