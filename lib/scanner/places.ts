// lib/scanner/places.ts
import type { PlaceScanResult } from '@/types/scanner'

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place'

export async function searchPlaces(
  city: string,
  placeType: string,
  apiKey: string,
): Promise<{ results: PlaceScanResult[]; rateLimited: boolean }> {
  const query = `${placeType.replace(/_/g, ' ')} ${city} France`
  let placeIds: string[]
  let rateLimited = false

  try {
    const fetchResult = await fetchAllPlaceIds(query, apiKey)
    placeIds = fetchResult.ids
    rateLimited = fetchResult.rateLimited
  } catch {
    return { results: [], rateLimited: false }
  }

  const results: PlaceScanResult[] = []
  for (const placeId of placeIds) {
    const detail = await fetchPlaceDetails(placeId, apiKey)
    if (detail) results.push(detail)
  }

  return { results, rateLimited }
}

async function fetchAllPlaceIds(
  query: string,
  apiKey: string,
): Promise<{ ids: string[]; rateLimited: boolean }> {
  const ids: string[] = []
  let pageToken: string | undefined
  let rateLimited = false

  for (let page = 0; page < 3; page++) {
    const url = new URL(`${PLACES_BASE}/textsearch/json`)
    url.searchParams.set('query', query)
    url.searchParams.set('key', apiKey)
    url.searchParams.set('language', 'fr')
    if (pageToken) url.searchParams.set('pagetoken', pageToken)

    const res = await fetch(url.toString())
    if (!res.ok) break

    const data = await res.json()

    if (data.status === 'OVER_QUERY_LIMIT' || data.status === 'REQUEST_DENIED') {
      rateLimited = true
      break
    }
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') break

    for (const r of data.results ?? []) {
      if (r.place_id) ids.push(r.place_id)
    }

    pageToken = data.next_page_token
    if (!pageToken) break
    await sleep(2000)
  }

  return { ids, rateLimited }
}

async function fetchPlaceDetails(
  placeId: string,
  apiKey: string,
): Promise<PlaceScanResult | null> {
  const url = new URL(`${PLACES_BASE}/details/json`)
  url.searchParams.set('place_id', placeId)
  url.searchParams.set(
    'fields',
    'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,types',
  )
  url.searchParams.set('key', apiKey)
  url.searchParams.set('language', 'fr')

  try {
    const res = await fetch(url.toString())
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 'OK' || !data.result) return null

    const r = data.result
    const has_complete_gmb =
      !!r.formatted_phone_number &&
      !!r.website &&
      !!(r.opening_hours?.weekday_text?.length)

    return {
      place_id: r.place_id,
      name: r.name ?? '',
      address: r.formatted_address ?? '',
      phone: r.formatted_phone_number ?? null,
      website: r.website ?? null,
      gmb_rating: r.rating ?? null,
      gmb_reviews: r.user_ratings_total ?? null,
      has_complete_gmb,
    }
  } catch {
    return null
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
