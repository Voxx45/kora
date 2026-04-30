import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(): Promise<NextResponse> {
  const supabase = await createSupabaseServerClient()
  await supabase
    .from('scan_status')
    .update({ is_scanning: false, updated_at: new Date().toISOString() })
    .eq('id', 1)
  return NextResponse.json({ ok: true })
}
