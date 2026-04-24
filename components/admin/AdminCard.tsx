import { cn } from '@/lib/utils'

interface AdminCardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export function AdminCard({ children, className, padding = true }: AdminCardProps) {
  return (
    <div
      className={cn('rounded-[14px]', padding && 'p-4', className)}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {children}
    </div>
  )
}
