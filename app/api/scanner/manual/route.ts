import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { searchPlaces } from '@/lib/scanner/places'
import { scrapeWebsite } from '@/lib/scanner/scraper'
import { getPageSpeedScore } from '@/lib/scanner/pagespeed'
import { calculateScanScore } from '@/lib/scanner/scorer'
import { isValidCity, isValidPlaceType } from '@/lib/scanner/validation'
import type { ScanManualResponse } from '@/types/scanner'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request): Promise<NextResponse<ScanManualResponse>> {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ newResults: 0, error: 'Invalid JSON' }, { status: 400 })
  }

  const { city, place_type } = body as { city?: unknown; place_type?: unknown }

  if (!isValidCity(city) || !isValidPlaceType(place_type)) {
    return NextResponse.json({ newResults: 0, error: 'Invalid city or place_type' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const apiKey = process.env.GOOGLE_PLACES_API_KEY ?? ''
  const { results: places, rateLimited } = await searchPlaces(city, place_type, apiKey)

  if (rateLimited) return NextResponse.json({ newResults: 0, error: 'rate_limited' })

  let newResults = 0
  for (const place of places) {
    let has_https = false
    let has_viewport_meta: boolean | null = null
    let site_age_signal: 'old' | 'recent' | 'unknown' | null = null
    let pagespeed_mobile: number | null = null

    if (place.website) {
      const [scrape, ps] = await Promise.allSettled([
        scrapeWebsite(place.website),
        getPageSpeedScore(place.website),
      ])
      if (scrape.status === 'fulfilled') {
        has_https = scrape.value.has_https
        has_viewport_meta = scrape.value.has_viewport_meta
        site_age_signal = scrape.value.site_age_signal
      }
      if (ps.status === 'fulfilled') pagespeed_mobile = ps.value
    }

    const score = calculateScanScore({
      has_website: !!place.website,
      website_url: place.website,
      has_https,
      pagespeed_mobile,
      has_viewport_meta,
      site_age_signal,
      has_complete_gmb: place.has_complete_gmb,
    })

    const { error } = await supabase.from('scan_results').upsert(
      {
        place_id: place.place_id,
        name: place.name,
        city,
        place_type,
        score,
        website: place.website,
        phone: place.phone,
        address: place.address,
        gmb_rating: place.gmb_rating,
        gmb_reviews: place.gmb_reviews,
        has_website: !!place.website,
        has_https,
        scanned_at: new Date().toISOString(),
      },
      { onConflict: 'place_id' },
    )
    if (!error) newResults++
  }

  return NextResponse.json({ newResults })
}
