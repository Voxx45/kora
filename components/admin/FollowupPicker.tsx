'use client'
import { cn } from '@/lib/utils'

interface FollowupPickerProps {
  value?: string | null   // ISO 8601 string
  onChange: (value: string | null) => void
  className?: string
}

export function FollowupPicker({ value, onChange, className }: FollowupPickerProps) {
  const inputValue = value ? value.slice(0, 16) : ''
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-[9px] uppercase tracking-[1.5px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
        Date de relance
      </label>
      <div className="flex items-center gap-2">
        <input
          type="datetime-local"
          value={inputValue}
          onChange={e => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
          className="flex-1 text-[11px] px-3 py-2 rounded-[10px] outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.75)',
            colorScheme: 'dark',
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] px-2 py-1 rounded-[8px] transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
