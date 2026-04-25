import Link from 'next/link'

interface CtaBandProps {
  eyebrow?: string
  title: string
  subtitle?: string
  ctaLabel: string
  ctaHref: string
}

export function CtaBand({
  eyebrow = "PASSONS À L'ACTION",
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: CtaBandProps) {
  return (
    <section className="w-full py-16 px-6" style={{ background: '#1C1C1E' }}>
      <div className="max-w-[700px] mx-auto text-center">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[2.5px] mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {eyebrow}
          </p>
        )}
        <h2 className="text-[32px] font-black tracking-[-1px] text-white leading-[1.1] mb-3 whitespace-pre-line">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[13px] mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {subtitle}
          </p>
        )}
        <Link
          href={ctaHref}
          className="inline-flex items-center text-[12px] font-bold px-6 py-3 rounded-[100px] bg-white text-[#1C1C1E] hover:bg-[#F2F2F7] transition-colors"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  )
}
