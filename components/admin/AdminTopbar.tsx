'use client'

import { usePathname } from 'next/navigation'

const PAGE_LABELS: Record<string, string> = {
  '/admin/dashboard':  'Dashboard',
  '/admin/prospects':  'Prospects',
  '/admin/pipeline':   'Pipeline',
  '/admin/projets':    'Projets actifs',
  '/admin/calendrier': 'Calendrier',
  '/admin/notes':      'Notes',
  '/admin/scanner':    'Scanner IA',
  '/admin/reglages':   'Réglages',
}

interface AdminTopbarProps {
  actions?: React.ReactNode
}

export function AdminTopbar({ actions }: AdminTopbarProps) {
  const pathname = usePathname()
  const pageLabel = (() => {
    if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname]
    if (/^\/admin\/prospects\/[^/]+$/.test(pathname)) return 'Fiche prospect'
    return 'Admin'
  })()

  return (
    <div
      className="flex items-center justify-between px-5 py-3 flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
        <span>KORA</span>
        <span>/</span>
        <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{pageLabel}</span>
      </div>

      {/* Actions contextuelles */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
