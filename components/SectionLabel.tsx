import { cn } from '@/lib/utils'

interface SectionLabelProps {
  children: React.ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        'text-[11px] font-semibold uppercase tracking-[2px] text-[#8E8E93]',
        className
      )}
    >
      {children}
    </p>
  )
}
