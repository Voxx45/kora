import { cn } from '@/lib/utils'

type DeltaVariant = 'up' | 'down' | 'warning' | 'alert' | 'neutral'

interface KpiCardProps {
  value: string | number
  label: string
  delta?: string
  deltaVariant?: DeltaVariant
  className?: string
}

const deltaColors: Record<DeltaVariant, string> = {
  up:      'text-[#30D158]',
  down:    'text-[#FF453A]',
  warning: 'text-[#FF9F0A]',
  alert:   'text-[#FF453A]',
  neutral: 'text-[rgba(255,255,255,0.32)]',
}

export function KpiCard({ value, label, delta, deltaVariant = 'neutral', className }: KpiCardProps) {
  return (
    <div
      className={cn('rounded-[14px] p-[13px]', className)}
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="text-[20px] font-bold text-white tracking-[-0.5px]">{value}</div>
      <div
        className="text-[8px] uppercase tracking-[1.5px] mt-0.5"
        style={{ color: 'rgba(255,255,255,0.28)' }}
      >
        {label}
      </div>
      {delta && (
        <div className={cn('text-[9px] mt-1', deltaColors[deltaVariant])}>{delta}</div>
      )}
    </div>
  )
}
