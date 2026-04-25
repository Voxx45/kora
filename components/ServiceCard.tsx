import Link from 'next/link'

interface ServiceCardProps {
  icon: string
  title: string
  description: string
  href: string
}

export function ServiceCard({ icon, title, description, href }: ServiceCardProps) {
  return (
    <div
      className="group bg-white rounded-[16px] p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div className="text-[28px] leading-none">{icon}</div>
      <div>
        <h3 className="text-[13px] font-bold text-[#1C1C1E] mb-1">{title}</h3>
        <p className="text-[12px] leading-[1.6]" style={{ color: '#8E8E93' }}>{description}</p>
      </div>
      <Link
        href={href}
        className="text-[11px] font-semibold text-[#1C1C1E] mt-auto group-hover:underline"
      >
        En savoir plus →
      </Link>
    </div>
  )
}
