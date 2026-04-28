import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
  score: number
  className?: string
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const v = Math.max(0, Math.min(100, score))
  const color = v >= 80 ? '#30D158' : v >= 50 ? '#FF9F0A' : '#FF453A'
  const bg    = v >= 80 ? 'rgba(48,209,88,0.12)' : v >= 50 ? 'rgba(255,159,10,0.12)' : 'rgba(255,69,58,0.12)'
  return (
    <span
      className={cn('inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-[8px] tabular-nums', className)}
      style={{ background: bg, color }}
    >
      {v}
    </span>
  )
}
