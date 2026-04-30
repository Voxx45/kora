import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { ScanResult } from '@/types/scanner'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse<ScanResult[]>> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('scan_results')
    .select('*')
    .order('score', { ascending: false })
    .limit(100)
  return NextResponse.json(data ?? [])
}
