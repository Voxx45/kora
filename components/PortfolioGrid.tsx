'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface Project {
  id: string
  client: string
  category: 'site-web' | 'identite' | 'seo'
  services: string
  gradient: string
  tall?: boolean
}

interface PortfolioGridProps {
  projects: Project[]
}

const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'site-web', label: 'Site web' },
  { value: 'identite', label: 'Identité' },
  { value: 'seo', label: 'SEO local' },
] as const

type FilterValue = typeof FILTERS[number]['value']

export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const [active, setActive] = useState<FilterValue>('all')

  const filtered = active === 'all'
    ? projects
    : projects.filter(p => p.category === active)

  return (
    <div>
      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap mb-8">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            className={cn(
              'text-[11px] font-semibold px-4 py-1.5 rounded-[100px] transition-colors',
              active === f.value
                ? 'bg-[#1C1C1E] text-white'
                : 'text-[#8E8E93] hover:bg-black/10'
            )}
            style={active !== f.value ? { background: 'rgba(0,0,0,0.06)' } : undefined}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-[13px] py-12 text-center" style={{ color: '#8E8E93' }}>
          Aucune réalisation dans cette catégorie pour le moment.
        </p>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          style={{ gridAutoRows: '200px' }}
        >
          {filtered.map(project => (
            <div
              key={project.id}
              className={cn(
                'relative rounded-[18px] overflow-hidden transition-transform duration-300 hover:scale-[1.02] cursor-default',
                project.tall ? 'row-span-2' : ''
              )}
              style={{ background: project.gradient }}
            >
              {/* Glassmorphism overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 px-4 py-3.5"
                style={{
                  background: 'rgba(0,0,0,0.28)',
                  backdropFilter: 'blur(18px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                  borderTop: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <p className="text-[13px] font-bold text-white mb-0.5 leading-tight">{project.client}</p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{project.services}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
