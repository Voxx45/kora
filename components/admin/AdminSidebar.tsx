'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: '⬡' },
      { label: 'Prospects', href: '/admin/prospects', icon: '◎' },
      { label: 'Pipeline', href: '/admin/pipeline', icon: '⟳' },
    ],
  },
  {
    label: 'Projets',
    items: [
      { label: 'Projets actifs', href: '/admin/projets', icon: '▣' },
      { label: 'Calendrier', href: '/admin/calendrier', icon: '◷' },
      { label: 'Notes', href: '/admin/notes', icon: '◈' },
    ],
  },
  {
    label: 'Outils',
    items: [
      { label: 'Scanner IA', href: '/admin/scanner', icon: '⊙' },
      { label: 'Réglages', href: '/admin/reglages', icon: '⚙' },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="w-[188px] flex-shrink-0 flex flex-col py-[18px] px-3"
      style={{
        background: '#090B12',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <Link href="/admin/dashboard" className="block mb-1">
        <div className="text-[13px] font-black tracking-[1.5px] text-white">KORA</div>
      </Link>
      <div className="text-[9px] mb-5" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Espace de travail
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-2">
            <div
              className="text-[8px] font-bold uppercase tracking-[2px] px-2.5 mb-1.5"
              style={{ color: 'rgba(255,255,255,0.18)' }}
            >
              {group.label}
            </div>
            {group.items.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 text-[11.5px] px-2.5 py-2 rounded-[10px] mb-0.5 transition-colors',
                    active
                      ? 'bg-white/[0.08] text-white/90'
                      : 'text-white/32 hover:text-white/60 hover:bg-white/[0.04]'
                  )}
                  style={{ color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.32)' }}
                >
                  <span className="text-[13px]">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Utilisateur + déconnexion */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
        <div className="flex items-center gap-2 px-2 py-2">
          <div
            className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FCD34D, #F97316)' }}
          >
            K
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Admin
            </div>
            <div className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.25)' }}>
              KORA Studio
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-left text-[10px] px-2.5 py-1.5 rounded-[8px] transition-colors"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
