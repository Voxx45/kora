import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { ScanResult } from '@/types/scanner'

export const dynamic = 'force-dynamic'

export interface ScanResultsResponse {
  results: ScanResult[]
  total: number
}

export async function GET(req: NextRequest): Promise<NextResponse<ScanResultsResponse>> {
  const { searchParams } = req.nextUrl

  const q          = searchParams.get('q') ?? ''
  const type       = searchParams.get('type') ?? ''
  const scoreMin   = searchParams.get('score_min')
  const scoreMax   = searchParams.get('score_max')
  const hasWebsite = searchParams.get('has_website')  // 'true' | 'false' | null
  const promoted   = searchParams.get('promoted')     // 'false' | null
  const sort       = searchParams.get('sort') ?? 'score'
  const order      = searchParams.get('order') ?? 'desc'
  const offset     = parseInt(searchParams.get('offset') ?? '0', 10)
  const limit      = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

  const allowedSort = ['score', 'name', 'city']
  const safeSort = allowedSort.includes(sort) ? sort : 'score'
  const ascending = order === 'asc'

  const supabase = await createSupabaseServerClient()

  // Count query (no range)
  let countQuery = supabase
    .from('scan_results')
    .select('id', { count: 'exact', head: true })

  if (q)            countQuery = countQuery.or(`name.ilike.%${q}%,city.ilike.%${q}%`)
  if (type)         countQuery = countQuery.eq('place_type', type)
  if (scoreMin)     countQuery = countQuery.gte('score', parseInt(scoreMin, 10))
  if (scoreMax)     countQuery = countQuery.lte('score', parseInt(scoreMax, 10))
  if (hasWebsite !== null) countQuery = countQuery.eq('has_website', hasWebsite === 'true')
  if (promoted === 'false') countQuery = countQuery.eq('promoted', false)

  // Data query
  let dataQuery = supabase
    .from('scan_results')
    .select('*')
    .order(safeSort, { ascending })
    .range(offset, offset + limit - 1)

  if (q)            dataQuery = dataQuery.or(`name.ilike.%${q}%,city.ilike.%${q}%`)
  if (type)         dataQuery = dataQuery.eq('place_type', type)
  if (scoreMin)     dataQuery = dataQuery.gte('score', parseInt(scoreMin, 10))
  if (scoreMax)     dataQuery = dataQuery.lte('score', parseInt(scoreMax, 10))
  if (hasWebsite !== null) dataQuery = dataQuery.eq('has_website', hasWebsite === 'true')
  if (promoted === 'false') dataQuery = dataQuery.eq('promoted', false)

  const [{ count }, { data }] = await Promise.all([countQuery, dataQuery])

  return NextResponse.json({
    results: data ?? [],
    total: count ?? 0,
  })
}
