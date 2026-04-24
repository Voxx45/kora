'use client'

import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="relative inline-flex flex-col w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="absolute -top-[9px] left-[10px] text-[9px] font-semibold uppercase tracking-[1px] text-[#8E8E93] bg-[#FAFAFA] px-1 z-10"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full text-[13px] px-[14px] py-2.5 rounded-[12px]',
          'border border-black/10 bg-white text-[#1C1C1E]',
          'outline-none focus:border-black/30 focus:ring-2 focus:ring-black/[0.06]',
          'placeholder:text-[#C7C7CC]',
          className
        )}
        {...props}
      />
    </div>
  )
}
