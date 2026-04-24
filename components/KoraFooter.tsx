import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
  { label: 'Contact', href: '/contact' },
]

export function KoraFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="border-t mt-auto"
      style={{ borderColor: 'rgba(0,0,0,0.06)', background: '#F2F2F7' }}
    >
      <div className="max-w-[1100px] mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-black tracking-[1.5px] text-[#1C1C1E]">KORA</span>
          <span className="text-[11px] text-[#8E8E93]">© {year} · Studio digital local</span>
        </div>
        <nav className="flex items-center gap-4">
          {FOOTER_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
