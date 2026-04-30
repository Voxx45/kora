import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { FRENCH_CITIES } from '@/lib/scanner/cities'
import { PLACE_TYPES } from '@/lib/scanner/validation'

export const dynamic = 'force-dynamic'

export async function POST(): Promise<NextResponse> {
  const supabase = await createSupabaseServerClient()
  const now = new Date().toISOString()

  // Seed queue if empty
  const { count } = await supabase
    .from('scan_queue')
    .select('*', { count: 'exact', head: true })

  if ((count ?? 0) === 0) {
    const rows = FRENCH_CITIES.flatMap(city =>
      PLACE_TYPES.map(place_type => ({ city, place_type, status: 'pending' })),
    )
    // Insert in batches of 500
    for (let i = 0; i < rows.length; i += 500) {
      await supabase.from('scan_queue').insert(rows.slice(i, i + 500))
    }
  }

  await supabase
    .from('scan_status')
    .update({ is_scanning: true, last_error: null, updated_at: now })
    .eq('id', 1)

  return NextResponse.json({ ok: true })
}
