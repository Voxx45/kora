import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'default' | 'sm' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant = 'primary',
  size = 'default',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all disabled:opacity-50',
        // Sizes
        size === 'default' && 'text-[12px] px-5 py-[9px] rounded-[100px]',
        size === 'sm' && 'text-[11px] px-[14px] py-[6px] rounded-[16px]',
        size === 'icon' && 'w-9 h-9 rounded-full text-[14px]',
        // Variants
        variant === 'primary' && 'bg-[#1C1C1E] text-white hover:bg-[#2C2C2E]',
        variant === 'secondary' && 'bg-black/[0.06] text-[#1C1C1E] hover:bg-black/10',
        variant === 'ghost' && 'bg-transparent text-[#8E8E93] border border-black/10 hover:bg-black/[0.04]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
