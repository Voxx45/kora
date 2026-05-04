import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { isValidPlaceType } from '@/lib/scanner/validation'
import type { ScanResult } from '@/types/scanner'

export const dynamic = 'force-dynamic'

export interface ScanResultsResponse {
  results: ScanResult[]
  total: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, params: {
  safeQ: string; type: string; scoreMinNum: number | null; scoreMaxNum: number | null;
  hasWebsite: string | null; promoted: string | null;
}) {
  if (params.safeQ)   query = query.or(`name.ilike.%${params.safeQ}%,city.ilike.%${params.safeQ}%`)
  if (params.type)    query = query.eq('place_type', params.type)
  if (params.scoreMinNum !== null && !isNaN(params.scoreMinNum)) query = query.gte('score', params.scoreMinNum)
  if (params.scoreMaxNum !== null && !isNaN(params.scoreMaxNum)) query = query.lte('score', params.scoreMaxNum)
  if (params.hasWebsite !== null) query = query.eq('has_website', params.hasWebsite === 'true')
  if (params.promoted === 'false') query = query.eq('promoted', false)
  return query
}

export async function GET(req: NextRequest): Promise<NextResponse<ScanResultsResponse>> {
  const { searchParams } = req.nextUrl

  const q          = searchParams.get('q') ?? ''
  const rawType    = searchParams.get('type') ?? ''
  const type       = isValidPlaceType(rawType) ? rawType : ''
  const scoreMin   = searchParams.get('score_min')
  const scoreMax   = searchParams.get('score_max')
  const hasWebsite = searchParams.get('has_website')  // 'true' | 'false' | null
  const promoted   = searchParams.get('promoted')     // 'false' | null
  const sort       = searchParams.get('sort') ?? 'score'
  const order      = searchParams.get('order') ?? 'desc'
  const offset     = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10) || 0)
  const limit      = Math.min(Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10) || 50), 100)

  const allowedSort = ['score', 'name', 'city']
  const safeSort = allowedSort.includes(sort) ? sort : 'score'
  const ascending = order === 'asc'

  // Sanitize q to prevent PostgREST operator injection
  const safeQ = q.replace(/[%(),]/g, '')

  // Guard against NaN from malformed score params
  const scoreMinNum = scoreMin !== null && scoreMin !== '' ? parseInt(scoreMin, 10) : null
  const scoreMaxNum = scoreMax !== null && scoreMax !== '' ? parseInt(scoreMax, 10) : null

  const supabase = await createSupabaseServerClient()

  const filterParams = { safeQ, type, scoreMinNum, scoreMaxNum, hasWebsite, promoted }

  // Run both queries in parallel — filters are applied identically to ensure count and data match
  let countQuery = supabase.from('scan_results').select('id', { count: 'exact', head: true })
  countQuery = applyFilters(countQuery, filterParams)

  let dataQuery = supabase
    .from('scan_results')
    .select('*')
    .order(safeSort, { ascending })
    .range(offset, offset + limit - 1)
  dataQuery = applyFilters(dataQuery, filterParams)

  const [{ count, error: countError }, { data, error: dataError }] = await Promise.all([countQuery, dataQuery])

  // Surface Supabase errors rather than silently returning empty results
  if (countError || dataError) {
    return NextResponse.json({ results: [], total: 0 }, { status: 500 })
  }

  return NextResponse.json({
    results: data ?? [],
    total: count ?? 0,
  })
}
