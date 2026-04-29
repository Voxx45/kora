import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import type { Prospect } from '@/types/crm'

function getWeekStart(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function isSameWeek(a: Date, weekStart: Date): boolean {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)
  return a >= weekStart && a < weekEnd
}

const DAY_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

function groupByDay(ps: Prospect[]): Map<string, Prospect[]> {
  const map = new Map<string, Prospect[]>()
  for (const p of ps) {
    const d = new Date(p.next_followup_at!)
    const key = `${DAY_FR[d.getDay()]} ${d.getDate()} ${d.toLocaleString('fr-FR', { month: 'long' })}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return map
}

function Section({ title, ps }: { title: string; ps: Prospect[] }) {
  if (ps.length === 0) return null
  const byDay = groupByDay(ps)
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[10px] uppercase tracking-[1.5px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {title} ({ps.length} relance{ps.length > 1 ? 's' : ''})
      </h2>
      {Array.from(byDay.entries()).map(([day, items]) => (
        <div key={day} className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>┌─ {day}</p>
          {items.map(p => (
            <Link
              key={p.id}
              href={`/admin/prospects/${p.id}`}
              className="ml-4 flex items-center gap-2 text-[11px] hover:underline"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>│  ·</span>
              {p.entreprise ?? p.prenom}
              <ScoreBadge score={p.score} />
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}

export default async function CalendrierPage() {
  const supabase = await createSupabaseServerClient()
  const in4weeks = new Date(Date.now() + 28 * 86_400_000).toISOString()

  const { data } = await supabase
    .from('prospects')
    .select('id,prenom,entreprise,score,pipeline_stage,next_followup_at')
    .not('next_followup_at', 'is', null)
    .lte('next_followup_at', in4weeks)
    .order('next_followup_at', { ascending: true })

  const prospects = (data ?? []) as Prospect[]

  const now = new Date()
  const thisWeekStart  = getWeekStart(now)
  const nextWeekStart  = new Date(thisWeekStart)
  nextWeekStart.setDate(thisWeekStart.getDate() + 7)
  const laterWeekStart = new Date(nextWeekStart)
  laterWeekStart.setDate(nextWeekStart.getDate() + 7)

  const thisWeek = prospects.filter(p => isSameWeek(new Date(p.next_followup_at!), thisWeekStart))
  const nextWeek = prospects.filter(p => isSameWeek(new Date(p.next_followup_at!), nextWeekStart))
  const later    = prospects.filter(p => new Date(p.next_followup_at!) >= laterWeekStart)

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
        {prospects.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Aucune relance prévue dans les 4 prochaines semaines.
            </p>
          </div>
        ) : (
          <>
            {thisWeek.length === 0 && (
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Aucune relance prévue cette semaine.
              </p>
            )}
            <Section title="Cette semaine" ps={thisWeek} />
            <Section title="Semaine prochaine" ps={nextWeek} />
            <Section title="Plus tard" ps={later} />
          </>
        )}
      </div>
    </div>
  )
}
