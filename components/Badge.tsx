import { cn } from '@/lib/utils'

type BadgeVariant = 'hot' | 'warm' | 'new' | 'info' | 'gray'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  hot:  'bg-[rgba(255,69,58,0.1)] text-[#FF3B30]',
  warm: 'bg-[rgba(255,159,10,0.1)] text-[#FF9500]',
  new:  'bg-[rgba(48,209,88,0.1)] text-[#34C759]',
  info: 'bg-[rgba(0,122,255,0.1)] text-[#007AFF]',
  gray: 'bg-black/[0.06] text-[#8E8E93]',
}

export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[10px] font-semibold px-2.5 py-0.5 rounded-[10px]',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
