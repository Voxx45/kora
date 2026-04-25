'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    const params = new URLSearchParams(window.location.search)
    const raw = params.get('redirectTo') ?? ''
    const redirectTo = raw.startsWith('/') ? raw : '/admin/dashboard'
    router.push(redirectTo)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0E16' }}>
      {/* Halo doré centré */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,200,66,0.07) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <div
        className="relative z-10 w-[300px] rounded-[20px] p-8"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="text-[18px] font-black tracking-[2px] text-white mb-1">KORA</div>
          <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Espace admin · Accès restreint
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="login-email" className="block text-[10px] font-semibold uppercase tracking-[1px] mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@kora.fr"
              className="w-full rounded-[10px] px-3 py-2.5 text-[13px] text-white outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-[10px] font-semibold uppercase tracking-[1px] mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Mot de passe
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full rounded-[10px] px-3 py-2.5 text-[13px] text-white outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </div>

          {error && (
            <p className="text-[11px] text-center" style={{ color: '#FF453A' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[12px] py-2.5 text-[13px] font-bold bg-white text-[#1C1C1E] mt-1 disabled:opacity-50"
          >
            {loading ? 'Connexion…' : 'Se connecter →'}
          </button>
        </form>

        <p className="text-center text-[10px] mt-4" style={{ color: 'rgba(255,255,255,0.18)' }}>
          Aucun compte public · Admin uniquement
        </p>
      </div>
    </div>
  )
}
