'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
]

export function KoraNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(249, 249, 251, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="text-[15px] font-black tracking-[1.5px] text-[#1C1C1E]">
          KORA
        </Link>

        {/* Liens desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[12px] font-medium text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/contact"
            className="text-[11px] font-semibold px-[18px] py-[7px] rounded-[20px] bg-[#1C1C1E] text-white hover:bg-[#2C2C2E] transition-colors"
          >
            Démarrer un projet
          </Link>
        </div>

        {/* Hamburger mobile */}
        <button
          className="md:hidden text-[#1C1C1E] p-2"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-6 py-4 space-y-3"
          style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'rgba(249,249,251,0.98)' }}
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-[14px] text-[#1C1C1E] py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="block text-center text-[12px] font-semibold py-2.5 rounded-[12px] bg-[#1C1C1E] text-white mt-2"
            onClick={() => setMobileOpen(false)}
          >
            Démarrer un projet
          </Link>
        </div>
      )}
    </header>
  )
}
