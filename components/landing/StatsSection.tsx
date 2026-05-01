'use client'
import { useEffect, useRef, useState } from 'react'

function useCounter(target: number, duration = 1400) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = Date.now()
          const tick = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

const STATS = [
  { prefix: '+', target: 50, suffix: '',  label: 'clients accompagnés' },
  { prefix: '',  target: 49, suffix: '★', label: 'satisfaction client', divisor: 10 },
  { prefix: '',  target: 3,  suffix: ' ans', label: "d'expérience" },
  { prefix: '<', target: 24, suffix: 'h', label: 'temps de réponse' },
]

function StatCard({
  prefix, target, suffix, label, divisor, delay,
}: { prefix: string; target: number; suffix: string; label: string; divisor?: number; delay: number }) {
  const { count, ref } = useCounter(target, 1200 + delay * 100)
  const display = divisor ? (count / divisor).toFixed(1) : count

  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        padding: '32px 20px',
        textAlign: 'center',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        animation: `kora-fade-up 0.5s ease ${delay * 0.12}s both`,
      }}
    >
      <div style={{
        fontSize: 'clamp(36px, 4vw, 52px)',
        fontWeight: 900,
        letterSpacing: '-2px',
        color: '#1C1C1E',
        lineHeight: 1,
        marginBottom: '8px',
      }}>
        {prefix}{display}{suffix}
      </div>
      <div style={{ fontSize: '11px', color: '#8E8E93', fontWeight: 500, letterSpacing: '0.2px' }}>
        {label}
      </div>
    </div>
  )
}

export function StatsSection() {
  return (
    <section style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {STATS.map((s, i) => (
          <StatCard
            key={s.label}
            prefix={s.prefix}
            target={s.target}
            suffix={s.suffix}
            label={s.label}
            divisor={s.divisor}
            delay={i}
          />
        ))}
      </div>
    </section>
  )
}
