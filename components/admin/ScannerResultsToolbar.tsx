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
  !!f.q || !!f.type || !!f.scorePreset || !!f.hasWebsite || f.nonPromotedOnly

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
        onClick={() => onFilterChange({ nonPromotedOnly: !filters.nonPromotedOnly, page: 0 })}
        style={{
          ...inputStyle,
          cursor: 'pointer',
          background: filters.nonPromotedOnly ? 'rgba(0,122,255,0.2)' : 'rgba(255,255,255,0.06)',
          border: filters.nonPromotedOnly ? '1px solid rgba(0,122,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
          color: filters.nonPromotedOnly ? '#007AFF' : 'rgba(255,255,255,0.6)',
          fontWeight: filters.nonPromotedOnly ? 600 : 400,
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
