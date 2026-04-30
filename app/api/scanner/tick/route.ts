import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { searchPlaces } from '@/lib/scanner/places'
import { scrapeWebsite } from '@/lib/scanner/scraper'
import { getPageSpeedScore } from '@/lib/scanner/pagespeed'
import { calculateScanScore } from '@/lib/scanner/scorer'
import type { ScanTickResponse } from '@/types/scanner'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(): Promise<NextResponse<ScanTickResponse>> {
  const supabase = await createSupabaseServerClient()

  // 1. Check if scanning is active
  const { data: status } = await supabase
    .from('scan_status')
    .select('is_scanning')
    .eq('id', 1)
    .single()

  if (!status?.is_scanning) {
    return NextResponse.json({ done: true })
  }

  // 2. Get next queue item (pending or error)
  const { data: item } = await supabase
    .from('scan_queue')
    .select('*')
    .in('status', ['pending', 'error'])
    .order('id', { ascending: true })
    .limit(1)
    .single()

  if (!item) {
    // Queue exhausted — stop scanning
    await supabase
      .from('scan_status')
      .update({ is_scanning: false, updated_at: new Date().toISOString() })
      .eq('id', 1)
    return NextResponse.json({ done: true })
  }

  // 3. Mark item as running + update current city/type in status
  const now = new Date().toISOString()
  await supabase
    .from('scan_queue')
    .update({ status: 'running', updated_at: now })
    .eq('id', item.id)

  await supabase
    .from('scan_status')
    .update({ current_city: item.city, current_type: item.place_type, updated_at: now })
    .eq('id', 1)

  // 4. Search Places
  const apiKey = process.env.GOOGLE_PLACES_API_KEY ?? ''
  const { results: places, rateLimited } = await searchPlaces(item.city, item.place_type, apiKey)

  if (rateLimited) {
    await supabase
      .from('scan_queue')
      .update({ status: 'error', error_msg: 'Rate limited by Google Places API', updated_at: now })
      .eq('id', item.id)
    await supabase
      .from('scan_status')
      .update({ is_scanning: false, last_error: 'Google Places rate limit', updated_at: now })
      .eq('id', 1)
    return NextResponse.json({ done: true, error: 'rate_limited' })
  }

  // 5. Score each place result and upsert into scan_results
  let newResults = 0

  async function processPlace(place: (typeof places)[0]): Promise<void> {
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
      if (ps.status === 'fulfilled') {
        pagespeed_mobile = ps.value
      }
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
        city: item.city,
        place_type: item.place_type,
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

  // Process in batches of 5 for concurrency
  for (let i = 0; i < places.length; i += 5) {
    const batch = places.slice(i, i + 5)
    await Promise.allSettled(batch.map(processPlace))
  }

  // 6. Mark item done + update totals
  const doneNow = new Date().toISOString()
  await supabase
    .from('scan_queue')
    .update({ status: 'done', updated_at: doneNow })
    .eq('id', item.id)

  // Update totals directly (no RPC needed)
  const { data: currentStatus } = await supabase
    .from('scan_status')
    .select('total_scanned, total_results')
    .eq('id', 1)
    .single()

  await supabase
    .from('scan_status')
    .update({
      total_scanned: (currentStatus?.total_scanned ?? 0) + 1,
      total_results: (currentStatus?.total_results ?? 0) + newResults,
      updated_at: doneNow,
    })
    .eq('id', 1)

  return NextResponse.json({
    done: false,
    city: item.city,
    type: item.place_type,
    newResults,
  })
}
