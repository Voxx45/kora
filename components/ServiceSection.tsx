import { SectionLabel } from '@/components/SectionLabel'
import Link from 'next/link'

interface ServiceSectionProps {
  id: string
  number: string        // "01" – "06"
  icon: string
  title: string
  description: string
  includes: string[]
  price: string
  gradient: string
  reversed?: boolean    // true = text left, visual right
  serviceParam: string  // for ?service=... on contact link
}

export function ServiceSection({
  id,
  number,
  icon,
  title,
  description,
  includes,
  price,
  gradient,
  reversed = false,
  serviceParam,
}: ServiceSectionProps) {
  const visual = (
    <div className="flex-1 flex items-center justify-center">
      <div
        className="w-full max-w-[440px] aspect-[4/3] rounded-[22px] flex items-center justify-center"
        style={{ background: gradient }}
      >
        <span className="text-[64px]">{icon}</span>
      </div>
    </div>
  )

  const text = (
    <div className="flex-1 flex flex-col justify-center gap-4 max-w-[480px]">
      <SectionLabel>{number}</SectionLabel>
      <h2 className="text-[28px] font-bold tracking-[-0.8px] text-[#1C1C1E] leading-[1.15]">
        {title}
      </h2>
      <p className="text-[14px] leading-[1.7]" style={{ color: '#8E8E93' }}>
        {description}
      </p>
      <ul className="flex flex-col gap-1.5">
        {includes.map(item => (
          <li key={item} className="flex items-start gap-2 text-[13px] text-[#1C1C1E]">
            <span className="flex-shrink-0 mt-0.5" style={{ color: '#30D158' }}>✓</span>
            {item}
          </li>
        ))}
      </ul>
      <p className="text-[12px]" style={{ color: '#8E8E93' }}>{price}</p>
      <div>
        <Link
          href={`/contact?service=${encodeURIComponent(serviceParam)}`}
          className="inline-flex items-center text-[12px] font-semibold px-4 py-2 rounded-[100px] border border-black/20 text-[#1C1C1E] hover:bg-black/5 transition-colors"
        >
          Demander un devis →
        </Link>
      </div>
    </div>
  )

  return (
    <section
      id={id}
      className="py-16 px-6 scroll-mt-20"
      style={{ background: reversed ? '#F2F2F7' : '#FAFAFA' }}
    >
      <div
        className={`max-w-[1100px] mx-auto flex flex-col lg:flex-row items-center gap-12 ${
          reversed ? 'lg:flex-row-reverse' : ''
        }`}
      >
        {visual}
        {text}
      </div>
    </section>
  )
}
