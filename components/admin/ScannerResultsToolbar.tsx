'use client'
import { useState, useRef, useEffect } from 'react'
import { PLACE_TYPES } from '@/lib/scanner/validation'
import type { FilterState } from '@/lib/scanner/results-url'

interface Props {
  filters: FilterState
  total: number
  onFilterChange: (patch: Partial<FilterState>) => void
  onReset: () => void
}

const isActive = (f: FilterState) =>
  !!f.q || !!f.type || !!f.scorePreset || !!f.hasWebsite || f.nonPromotedOnly

/* ── Custom dropdown ────────────────────────────────────── */

interface DropdownOption { value: string; label: string }

function Dropdown({
  value, options, onChange, ariaLabel,
}: {
  value: string
  options: DropdownOption[]
  onChange: (v: string) => void
  ariaLabel: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const selected = options.find(o => o.value === value) ?? options[0]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          color: value ? '#fff' : 'rgba(255,255,255,0.5)',
          fontSize: 12,
          padding: '6px 10px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {selected.label}
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, marginLeft: 2 }}>▾</span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
            background: '#1C1C1E',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            minWidth: '100%',
            maxHeight: 280,
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            padding: '4px 0',
          }}
        >
          {options.map(opt => (
            <div
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                padding: '7px 14px',
                fontSize: 12,
                cursor: 'pointer',
                color: opt.value === value ? '#007AFF' : 'rgba(255,255,255,0.75)',
                background: opt.value === value ? 'rgba(0,122,255,0.12)' : 'transparent',
                fontWeight: opt.value === value ? 600 : 400,
              }}
              onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (opt.value !== value) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Toolbar ────────────────────────────────────────────── */

const SCORE_OPTIONS: DropdownOption[] = [
  { value: '', label: 'Tous les scores' },
  { value: 'high', label: 'Fort potentiel (≥ 60)' },
  { value: 'medium', label: 'Potentiel moyen (40–59)' },
  { value: 'low', label: 'Faible (< 40)' },
]

const WEBSITE_OPTIONS: DropdownOption[] = [
  { value: '', label: 'Tous (site web)' },
  { value: 'false', label: 'Sans site' },
  { value: 'true', label: 'Avec site' },
]

const SECTOR_OPTIONS: DropdownOption[] = [
  { value: '', label: 'Tous les secteurs' },
  ...PLACE_TYPES.map(t => ({ value: t, label: t.replace(/_/g, ' ') })),
]

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
          aria-label="Rechercher"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            color: '#fff',
            fontSize: 12,
            padding: '6px 10px 6px 26px',
            outline: 'none',
            width: 200,
          }}
        />
      </div>

      {/* Secteur */}
      <Dropdown
        value={filters.type}
        options={SECTOR_OPTIONS}
        onChange={v => onFilterChange({ type: v, page: 0 })}
        ariaLabel="Secteur"
      />

      {/* Score */}
      <Dropdown
        value={filters.scorePreset}
        options={SCORE_OPTIONS}
        onChange={v => onFilterChange({ scorePreset: v as FilterState['scorePreset'], page: 0 })}
        ariaLabel="Score"
      />

      {/* Site web */}
      <Dropdown
        value={filters.hasWebsite}
        options={WEBSITE_OPTIONS}
        onChange={v => onFilterChange({ hasWebsite: v as FilterState['hasWebsite'], page: 0 })}
        ariaLabel="Site web"
      />

      {/* Non promus toggle */}
      <button
        type="button"
        onClick={() => onFilterChange({ nonPromotedOnly: !filters.nonPromotedOnly, page: 0 })}
        aria-pressed={filters.nonPromotedOnly}
        style={{
          background: filters.nonPromotedOnly ? 'rgba(0,122,255,0.2)' : 'rgba(255,255,255,0.06)',
          border: filters.nonPromotedOnly ? '1px solid rgba(0,122,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          color: filters.nonPromotedOnly ? '#007AFF' : 'rgba(255,255,255,0.6)',
          fontSize: 12,
          padding: '6px 10px',
          cursor: 'pointer',
          fontWeight: filters.nonPromotedOnly ? 600 : 400,
          whiteSpace: 'nowrap',
        }}
      >
        Non promus seulement
      </button>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {isActive(filters) && (
          <button
            type="button"
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
          <span style={{ color: '#fff', fontWeight: 600 }}>{(total ?? 0).toLocaleString('fr-FR')}</span>{' '}
          résultat{(total ?? 0) > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
