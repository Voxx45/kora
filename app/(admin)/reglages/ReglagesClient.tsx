'use client'
import { useState, useTransition } from 'react'
import { testSmtp, testGroq } from '@/lib/actions/settings'

interface EnvVar { name: string; present: boolean }

interface Props {
  email: string
  envStatus: EnvVar[]
  version: string
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-[14px] p-5 flex flex-col gap-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <h2 className="text-[10px] uppercase tracking-[1.5px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function TestButton({
  label,
  action,
}: {
  label: string
  action: () => Promise<{ success: boolean; error?: string }>
}) {
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)
  const [pending, start] = useTransition()

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          setResult(null)
          start(async () => {
            const r = await action()
            setResult(r)
          })
        }}
        disabled={pending}
        className="px-3 py-1.5 rounded-[10px] text-[11px] font-semibold"
        style={{
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.7)',
          opacity: pending ? 0.5 : 1,
        }}
      >
        {pending ? 'Test en cours…' : label}
      </button>
      {result && (
        <span className="text-[11px]" style={{ color: result.success ? '#30D158' : '#FF453A' }}>
          {result.success ? '✓ OK' : `✗ ${result.error}`}
        </span>
      )}
    </div>
  )
}

export function ReglagesClient({ email, envStatus, version }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 max-w-[560px]">
      <Section title="Profil admin">
        <div className="flex items-center justify-between">
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {email || '—'}
          </p>
        </div>
      </Section>

      <Section title="Variables d'environnement">
        <div className="flex flex-col gap-2">
          {envStatus.map(v => (
            <div key={v.name} className="flex items-center justify-between">
              <code
                className="text-[10px]"
                style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}
              >
                {v.name}
              </code>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {v.present ? '••••••••' : ''}
                </span>
                <span>{v.present ? '✅' : '❌'}</span>
              </div>
            </div>
          ))}
        </div>
        <div
          className="flex flex-col gap-2 pt-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <TestButton label="Tester l'envoi SMTP" action={testSmtp} />
          <TestButton label="Tester Groq" action={testGroq} />
        </div>
      </Section>

      <Section title="Informations">
        <div className="flex items-center justify-between">
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Version</span>
          <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
            v{version}
          </span>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] hover:underline"
          style={{ color: '#0A84FF' }}
        >
          Voir la vitrine publique ↗
        </a>
      </Section>
    </div>
  )
}
