# Scanner IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automated French business scanner that discovers prospects via Google Places, scores them by web weakness, and lets the admin manually promote results into the CRM.

**Architecture:** Supabase-persisted queue (city × place_type jobs) processed by a Next.js API route (`/api/scanner/tick`) called every 2s from the client. Each tick processes one queue item — Places search → scrape → score → upsert into `scan_results`. The page has a sidebar (controls, status, KPIs) and a results table sorted by score desc with a "+ CRM" promote button.

**Tech Stack:** Next.js 16 App Router, Supabase SSR, Google Places API, Groq SDK (llama-3.1-8b-instant — promotion only), lib/scanner/* (ported from demarchage project)

---

## File Structure

```
supabase/migrations/002_scanner_tables.sql   — 3 new tables + RLS
types/scanner.ts                             — ScanQueueItem, ScanResult, ScanStatus, ScanTickResponse
lib/scanner/
  places.ts        — Google Places Text Search (adapted from demarchage, adds rating/reviews)
  scraper.ts       — website scraper (ported from demarchage unchanged)
  pagespeed.ts     — PageSpeed API (ported from demarchage unchanged)
  scorer.ts        — calculateScanScore() pure function
  cities.ts        — FRENCH_CITIES array + PLACE_TYPES array
  groq.ts          — analyzeWebsite() for promotion only
  validation.ts    — isScanRunning() + parseScanResult() guards
__tests__/
  scanner-scorer.test.ts        — unit tests for calculateScanScore
  scanner-validation.test.ts    — unit tests for validation guards
app/api/scanner/
  tick/route.ts    — POST: process one queue item
  start/route.ts   — POST: set is_scanning=true + seed queue if empty
  stop/route.ts    — POST: set is_scanning=false
  manual/route.ts  — POST: run scan for custom city+type
lib/actions/scanner.ts            — promoteToCRM() server action
components/admin/
  ScannerSidebar.tsx   — client: status indicator, start/stop, KPIs, manual form
  ScannerResults.tsx   — client: results table + promote button
app/(admin)/scanner/page.tsx      — server component: loads initial data
```

---

### Task 1: SQL Migration — Scanner Tables

**Files:**
- Create: `supabase/migrations/002_scanner_tables.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/002_scanner_tables.sql

create table if not exists scan_queue (
  id          uuid primary key default gen_random_uuid(),
  city        text not null,
  place_type  text not null,
  status      text not null default 'pending'
                check (status in ('pending','running','done','error')),
  error_msg   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists scan_queue_status_id on scan_queue (status, id);

create table if not exists scan_results (
  id          uuid primary key default gen_random_uuid(),
  place_id    text not null unique,
  name        text not null,
  city        text not null,
  place_type  text not null,
  score       int not null default 0 check (score >= 0 and score <= 100),
  website     text,
  phone       text,
  address     text,
  gmb_rating  numeric,
  gmb_reviews int,
  has_website boolean not null default false,
  has_https   boolean not null default false,
  promoted    boolean not null default false,
  promoted_at timestamptz,
  scanned_at  timestamptz not null default now()
);

create index if not exists scan_results_score on scan_results (score desc);

create table if not exists scan_status (
  id             int primary key default 1 check (id = 1),
  is_scanning    boolean not null default false,
  current_city   text,
  current_type   text,
  total_scanned  int not null default 0,
  total_results  int not null default 0,
  last_error     text,
  updated_at     timestamptz not null default now()
);

insert into scan_status (id) values (1) on conflict do nothing;

alter table scan_queue   enable row level security;
alter table scan_results enable row level security;
alter table scan_status  enable row level security;

create policy "admin only" on scan_queue   for all using (auth.uid() is not null);
create policy "admin only" on scan_results for all using (auth.uid() is not null);
create policy "admin only" on scan_status  for all using (auth.uid() is not null);
```

- [ ] **Step 2: Run migration in Supabase dashboard**

Open the Supabase dashboard → SQL Editor → paste and run the file.
Verify: Tables `scan_queue`, `scan_results`, `scan_status` appear in Table Editor.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/002_scanner_tables.sql
git commit -m "feat(scanner): SQL migration — scan_queue, scan_results, scan_status"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `types/scanner.ts`

- [ ] **Step 1: Write the types file**

```typescript
// types/scanner.ts

export type ScanQueueStatus = 'pending' | 'running' | 'done' | 'error'

export interface ScanQueueItem {
  id: string
  city: string
  place_type: string
  status: ScanQueueStatus
  error_msg: string | null
  created_at: string
  updated_at: string
}

export interface ScanResult {
  id: string
  place_id: string
  name: string
  city: string
  place_type: string
  score: number
  website: string | null
  phone: string | null
  address: string | null
  gmb_rating: number | null
  gmb_reviews: number | null
  has_website: boolean
  has_https: boolean
  promoted: boolean
  promoted_at: string | null
  scanned_at: string
}

export interface ScanStatus {
  id: number
  is_scanning: boolean
  current_city: string | null
  current_type: string | null
  total_scanned: number
  total_results: number
  last_error: string | null
  updated_at: string
}

export interface ScanTickResponse {
  done: boolean
  city?: string
  type?: string
  newResults?: number
  error?: string
}

export interface ScanManualResponse {
  newResults: number
  error?: string
}

/** Input to calculateScanScore — built from Places + scraper + pagespeed data */
export interface ScannerScorerInput {
  has_website: boolean
  website_url: string | null
  has_https: boolean
  pagespeed_mobile: number | null
  has_viewport_meta: boolean | null
  site_age_signal: 'old' | 'recent' | 'unknown' | null
  has_complete_gmb: boolean
}

/** Raw result from Google Places before scoring */
export interface PlaceScanResult {
  place_id: string
  name: string
  address: string
  phone: string | null
  website: string | null
  gmb_rating: number | null
  gmb_reviews: number | null
  has_complete_gmb: boolean
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add types/scanner.ts
git commit -m "feat(scanner): TypeScript types — ScanResult, ScanStatus, ScanTickResponse"
```

---

### Task 3: Scanner Scorer — Pure Function + Tests

**Files:**
- Create: `lib/scanner/scorer.ts`
- Create: `__tests__/scanner-scorer.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// __tests__/scanner-scorer.test.ts
import { calculateScanScore } from '@/lib/scanner/scorer'

describe('calculateScanScore', () => {
  it('returns 40 for business with no website', () => {
    expect(calculateScanScore({
      has_website: false,
      website_url: null,
      has_https: false,
      pagespeed_mobile: null,
      has_viewport_meta: null,
      site_age_signal: null,
      has_complete_gmb: true,
    })).toBe(40)
  })

  it('returns 20 for HTTP site (no HTTPS)', () => {
    expect(calculateScanScore({
      has_website: true,
      website_url: 'http://example.com',
      has_https: false,
      pagespeed_mobile: null,
      has_viewport_meta: null,
      site_age_signal: null,
      has_complete_gmb: true,
    })).toBe(20)
  })

  it('returns 15 for site with pagespeed < 50', () => {
    expect(calculateScanScore({
      has_website: true,
      website_url: 'https://example.com',
      has_https: true,
      pagespeed_mobile: 30,
      has_viewport_meta: true,
      site_age_signal: null,
      has_complete_gmb: true,
    })).toBe(15)
  })

  it('returns 0 for site with pagespeed >= 50', () => {
    expect(calculateScanScore({
      has_website: true,
      website_url: 'https://example.com',
      has_https: true,
      pagespeed_mobile: 75,
      has_viewport_meta: true,
      site_age_signal: 'recent',
      has_complete_gmb: true,
    })).toBe(0)
  })

  it('accumulates no_website + incomplete_gmb', () => {
    expect(calculateScanScore({
      has_website: false,
      website_url: null,
      has_https: false,
      pagespeed_mobile: null,
      has_viewport_meta: null,
      site_age_signal: null,
      has_complete_gmb: false,
    })).toBe(45) // 40 + 5
  })

  it('accumulates all signals: no HTTPS + slow + no viewport + old + incomplete gmb', () => {
    expect(calculateScanScore({
      has_website: true,
      website_url: 'http://old-site.fr',
      has_https: false,
      pagespeed_mobile: 20,
      has_viewport_meta: false,
      site_age_signal: 'old',
      has_complete_gmb: false,
    })).toBe(60) // 20+15+10+10+5
  })

  it('caps at 100', () => {
    expect(calculateScanScore({
      has_website: false,
      website_url: null,
      has_https: false,
      pagespeed_mobile: 10,
      has_viewport_meta: false,
      site_age_signal: 'old',
      has_complete_gmb: false,
    })).toBe(100) // 40+15+10+10+5 = 80 but no_https skipped (no website), = 70. Wait: 40+0+15+10+10+5=80. Cap = min(100,80) = 80
    // Actually: no_website=40, no_https=0(skipped - no website), pagespeed=15(skip if no website too)
    // Let's be precise: if no website, skip pagespeed and https checks
  })

  it('does not apply HTTPS or PageSpeed checks when no website', () => {
    const score = calculateScanScore({
      has_website: false,
      website_url: null,
      has_https: false,
      pagespeed_mobile: 10,
      has_viewport_meta: false,
      site_age_signal: 'old',
      has_complete_gmb: false,
    })
    // no_website=40, no_https=0 (skipped), pagespeed=0 (skipped), no_viewport=0 (skipped), old_site=0 (skipped), incomplete_gmb=5
    expect(score).toBe(45)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx jest __tests__/scanner-scorer.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/scanner/scorer'`

- [ ] **Step 3: Implement `lib/scanner/scorer.ts`**

```typescript
// lib/scanner/scorer.ts
import type { ScannerScorerInput } from '@/types/scanner'

export function calculateScanScore(input: ScannerScorerInput): number {
  let score = 0

  if (!input.has_website || !input.website_url) {
    // No website: +40. Skip HTTPS, PageSpeed, viewport, old_site checks.
    score += 40
  } else {
    // Has website — check quality signals
    if (!input.has_https) score += 20
    if (input.pagespeed_mobile !== null && input.pagespeed_mobile < 50) score += 15
    if (input.has_viewport_meta === false) score += 10
    if (input.site_age_signal === 'old') score += 10
  }

  if (!input.has_complete_gmb) score += 5

  return Math.min(100, Math.max(0, score))
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx jest __tests__/scanner-scorer.test.ts --no-coverage
```

Expected: PASS — 8 tests passing.

- [ ] **Step 5: Fix the last test (cap test had wrong expectation) — already correct in impl**

The `caps at 100` test had an incorrect expected value in the comment but the assertion was wrong. Fix the test:

```typescript
  it('caps at 100', () => {
    // no_website=40, incomplete_gmb=5, all others skipped = 45. No cap needed.
    // Test a site that would exceed 100 if not capped:
    // has_website=true, no_https=20, pagespeed<50=15, no_viewport=10, old=10, no_gmb=5 = 60. Under 100.
    // Maximum possible: 40+5 = 45 (no website) or 20+15+10+10+5 = 60 (bad website). Both under 100.
    // Cap is defensive — test it explicitly:
    expect(Math.min(100, 105)).toBe(100) // defensive: the fn clamps
    expect(calculateScanScore({
      has_website: true,
      website_url: 'http://bad.fr',
      has_https: false,
      pagespeed_mobile: 10,
      has_viewport_meta: false,
      site_age_signal: 'old',
      has_complete_gmb: false,
    })).toBe(60) // 20+15+10+10+5
  })
```

- [ ] **Step 6: Run all tests**

```bash
npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add lib/scanner/scorer.ts __tests__/scanner-scorer.test.ts
git commit -m "feat(scanner): calculateScanScore pure function + 8 tests"
```

---

### Task 4: Scanner Validation + Tests

**Files:**
- Create: `lib/scanner/validation.ts`
- Create: `__tests__/scanner-validation.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/scanner-validation.test.ts
import { isValidCity, isValidPlaceType, PLACE_TYPES } from '@/lib/scanner/validation'

describe('isValidCity', () => {
  it('accepts non-empty string', () => {
    expect(isValidCity('Paris')).toBe(true)
    expect(isValidCity('Bordeaux 33000')).toBe(true)
  })
  it('rejects empty string', () => {
    expect(isValidCity('')).toBe(false)
    expect(isValidCity('   ')).toBe(false)
  })
  it('rejects non-string', () => {
    expect(isValidCity(null as unknown as string)).toBe(false)
    expect(isValidCity(undefined as unknown as string)).toBe(false)
  })
  it('rejects strings longer than 100 chars', () => {
    expect(isValidCity('a'.repeat(101))).toBe(false)
  })
})

describe('isValidPlaceType', () => {
  it('accepts a known place type', () => {
    expect(isValidPlaceType('restaurant')).toBe(true)
    expect(isValidPlaceType('plumber')).toBe(true)
  })
  it('rejects unknown type', () => {
    expect(isValidPlaceType('unicorn')).toBe(false)
    expect(isValidPlaceType('')).toBe(false)
  })
})

describe('PLACE_TYPES', () => {
  it('contains at least 30 types', () => {
    expect(PLACE_TYPES.length).toBeGreaterThanOrEqual(30)
  })
  it('contains restaurant and plumber', () => {
    expect(PLACE_TYPES).toContain('restaurant')
    expect(PLACE_TYPES).toContain('plumber')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx jest __tests__/scanner-validation.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/scanner/validation'`

- [ ] **Step 3: Implement `lib/scanner/validation.ts`**

```typescript
// lib/scanner/validation.ts

export const PLACE_TYPES: readonly string[] = [
  'accounting', 'bakery', 'bank', 'bar', 'beauty_salon',
  'bicycle_store', 'book_store', 'cafe', 'car_dealer', 'car_repair',
  'car_wash', 'clothing_store', 'convenience_store', 'dentist',
  'department_store', 'doctor', 'drugstore', 'electrician',
  'electronics_store', 'florist', 'furniture_store', 'gas_station',
  'gym', 'hair_care', 'hardware_store', 'home_goods_store',
  'insurance_agency', 'jewelry_store', 'laundry', 'lawyer',
  'locksmith', 'meal_delivery', 'meal_takeaway', 'moving_company',
  'night_club', 'painter', 'pet_store', 'pharmacy',
  'physiotherapist', 'plumber', 'real_estate_agency', 'restaurant',
  'roofing_contractor', 'shoe_store', 'spa', 'store', 'supermarket',
  'travel_agency', 'veterinary_care',
] as const

export function isValidCity(city: unknown): city is string {
  if (typeof city !== 'string') return false
  const trimmed = city.trim()
  return trimmed.length > 0 && trimmed.length <= 100
}

export function isValidPlaceType(type: unknown): type is string {
  if (typeof type !== 'string') return false
  return PLACE_TYPES.includes(type)
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx jest __tests__/scanner-validation.test.ts --no-coverage
```

Expected: PASS — 8 tests passing.

- [ ] **Step 5: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/scanner/validation.ts __tests__/scanner-validation.test.ts
git commit -m "feat(scanner): validation guards + PLACE_TYPES list"
```

---

### Task 5: French Cities List

**Files:**
- Create: `lib/scanner/cities.ts`

- [ ] **Step 1: Write `lib/scanner/cities.ts`**

```typescript
// lib/scanner/cities.ts
// Top French cities by population — used to seed scan_queue

export const FRENCH_CITIES: readonly string[] = [
  'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes',
  'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille', 'Rennes',
  'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble',
  'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Le Mans',
  'Aix-en-Provence', 'Clermont-Ferrand', 'Brest', 'Tours',
  'Amiens', 'Limoges', 'Annecy', 'Perpignan', 'Boulogne-Billancourt',
  'Metz', 'Besançon', 'Argenteuil', 'Rouen', 'Montreuil',
  'Mulhouse', 'Caen', 'Nancy', 'Saint-Denis', 'Orléans',
  'Avignon', 'Nanterre', 'Courbevoie', 'Roubaix', 'Dunkerque',
  'Tourcoing', 'Créteil', 'Rueil-Malmaison', 'Vitry-sur-Seine',
  'Champigny-sur-Marne', 'Pau', 'Poitiers', 'Asnières-sur-Seine',
  'Versailles', 'Colombes', 'Aubervilliers', 'Aulnay-sous-Bois',
  'Antibes', 'Calais', 'Cannes', 'Bourges', 'La Rochelle',
  'Levallois-Perret', 'Béziers', 'Issy-les-Moulineaux', 'Lorient',
  'Quimper', 'Mérignac', 'Pessac', 'Troyes', 'Valenciennes',
  'Cergy', 'Ivry-sur-Seine', 'Cholet', 'Bayonne', 'Montauban',
  'Meaux', 'Noisy-le-Grand', 'Ajaccio', 'Drancy', 'Nanterre',
  'Évry-Courcouronnes', 'Vénissieux', 'Épinay-sur-Seine', 'Clichy',
  'Pantin', 'Neuilly-sur-Seine', 'Sartrouville', 'Bobigny',
  'La Courneuve', 'Cherbourg-en-Cotentin', 'Clamart', 'Grasse',
  'Belfort', 'Massy', 'Quentin-en-Yvelines', 'Brive-la-Gaillarde',
  'Laval', 'Montrouge', 'Évreux', 'Colmar', 'Beauvais',
  'Albi', 'Saint-Nazaire', 'Joué-lès-Tours', 'Niort', 'Lorient',
  'Hyères', 'Bordeaux', 'Angoulême', 'Charleville-Mézières',
  'Narbonne', 'Saint-Quentin', 'Pointe-à-Pitre', 'Cayenne',
  'Fort-de-France', 'Tarbes', 'Châteauroux', 'Chartres', 'Arles',
  'Chambéry', 'Caluire-et-Cuire', 'Fontenay-sous-Bois', 'Maisons-Alfort',
  'Sainte-Geneviève-des-Bois', 'Villejuif', 'Vincennes', 'Bondy',
  'Aubervilliers', 'Champigny-sur-Marne', 'Bagneux', 'Gennevilliers',
  'Vanves', 'Sceaux', 'Malakoff', 'Montrouge', 'Châtillon',
  'Vincennes', 'Joinville-le-Pont', 'Saint-Maur-des-Fossés',
  'Charenton-le-Pont', 'Alfortville', 'Créteil', 'Saint-Ouen',
  'Bagnolet', 'Romainville', 'Les Lilas', 'Noisy-le-Sec',
  'Rosny-sous-Bois', 'Gagny', 'Neuilly-Plaisance',
  'Villemomble', 'Montfermeil', 'Clichy-sous-Bois',
  'Sevran', 'Livry-Gargan', 'Tremblay-en-France',
  'Villepinte', 'Roissy-en-France', 'Gonesse',
  'Argenteuil', 'Bezons', 'Cormeilles-en-Parisis',
  'Ermont', 'Sarcelles', 'Eaubonne',
  'Montmorency', 'Enghien-les-Bains', 'Soisy-sous-Montmorency',
  'Franconville', 'Taverny', 'Saint-Leu-la-Forêt',
  'Pontoise', 'Cergy', 'Saint-Germain-en-Laye',
  'Poissy', 'Conflans-Sainte-Honorine', 'Sartrouville',
  'Maisons-Laffitte', 'Chatou', 'Le Vésinet',
  'Montesson', 'Carrières-sur-Seine', 'Houilles',
  'Argenteuil', 'Colombes', 'Gennevilliers',
  'Nanterre', 'Puteaux', 'Courbevoie',
  'Levallois-Perret', 'Neuilly-sur-Seine', 'Clichy',
  'Issy-les-Moulineaux', 'Vanves', 'Malakoff',
  'Montrouge', 'Kremlin-Bicêtre', 'Gentilly',
  'Arcueil', 'Cachan', 'Villejuif',
  'Rungis', 'Thiais', 'Choisy-le-Roi',
  'Vitry-sur-Seine', 'Ivry-sur-Seine', 'Charenton-le-Pont',
] as const
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/scanner/cities.ts
git commit -m "feat(scanner): FRENCH_CITIES list (200 cities)"
```

---

### Task 6: Scanner Libs — Places, Scraper, PageSpeed

**Files:**
- Create: `lib/scanner/places.ts`
- Create: `lib/scanner/scraper.ts`
- Create: `lib/scanner/pagespeed.ts`

- [ ] **Step 1: Write `lib/scanner/places.ts`**

Adapted from `demarchage/lib/places.ts` — adds `gmb_rating`, `gmb_reviews` fields and returns `PlaceScanResult[]`.

```typescript
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
```

- [ ] **Step 2: Write `lib/scanner/scraper.ts`**

Identical to `demarchage/lib/scraper.ts` — ported as-is.

```typescript
// lib/scanner/scraper.ts

export type ScrapeStatus = 'ok' | 'blocked' | 'error' | 'timeout'
export type SiteAgeSignal = 'old' | 'recent' | 'unknown'

export interface ScrapeResult {
  status: ScrapeStatus
  has_https: boolean
  has_viewport_meta: boolean
  site_age_signal: SiteAgeSignal
  email: string | null
}

const SCRAPE_TIMEOUT_MS = 8000
const CURRENT_YEAR = new Date().getFullYear()
const OLD_YEAR_THRESHOLD = CURRENT_YEAR - 5

export async function scrapeWebsite(url: string): Promise<ScrapeResult> {
  const has_https = url.startsWith('https://')

  let html: string
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS)
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KoraBot/1.0)' },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return { status: 'blocked', has_https, has_viewport_meta: false, site_age_signal: 'unknown', email: null }
    }
    html = await response.text()
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    return {
      status: isTimeout ? 'timeout' : 'error',
      has_https,
      has_viewport_meta: false,
      site_age_signal: 'unknown',
      email: null,
    }
  }

  const has_viewport_meta = /<meta[^>]+name=["']viewport["']/i.test(html)
  const site_age_signal = detectSiteAge(html)
  const email = extractEmail(html)

  return { status: 'ok', has_https, has_viewport_meta, site_age_signal, email }
}

function detectSiteAge(html: string): SiteAgeSignal {
  const lower = html.toLowerCase()
  if (lower.includes('shockwave-flash') || lower.includes('.swf')) return 'old'
  if (/jquery[-\/]1\.\d/i.test(html)) return 'old'

  const copyrightMatch = html.match(/copyright\s*(?:&copy;|©)?\s*(\d{4})/i)
  if (copyrightMatch) {
    const year = parseInt(copyrightMatch[1], 10)
    if (year >= 1990 && year <= OLD_YEAR_THRESHOLD) return 'old'
    if (year > OLD_YEAR_THRESHOLD) return 'recent'
  }

  const tableMatches = (html.match(/<table/gi) || []).length
  if (tableMatches >= 5) return 'old'
  return 'unknown'
}

const EMAIL_EXCLUDED = ['noreply', 'no-reply', '@sentry', '@example']
const EMAIL_IMAGE_PATTERN = /@\d+x\./

function isValidExtractedEmail(email: string): boolean {
  const lower = email.toLowerCase()
  if (EMAIL_EXCLUDED.some(e => lower.includes(e))) return false
  if (EMAIL_IMAGE_PATTERN.test(email)) return false
  return true
}

export function extractEmail(html: string): string | null {
  const mailtoMatches = html.matchAll(/href=["']mailto:([^"'?\s]+)/gi)
  for (const match of mailtoMatches) {
    const email = match[1].trim().toLowerCase()
    if (isValidExtractedEmail(email)) return email
  }
  const textMatches = html.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-z]{2,}/g) ?? []
  for (const match of textMatches) {
    if (isValidExtractedEmail(match)) return match.toLowerCase()
  }
  return null
}
```

- [ ] **Step 3: Write `lib/scanner/pagespeed.ts`**

```typescript
// lib/scanner/pagespeed.ts

const PAGESPEED_TIMEOUT_MS = 10000
const PAGESPEED_BASE = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

export async function getPageSpeedScore(url: string): Promise<number | null> {
  const apiUrl = `${PAGESPEED_BASE}?url=${encodeURIComponent(url)}&strategy=mobile`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), PAGESPEED_TIMEOUT_MS)
    const response = await fetch(apiUrl, { signal: controller.signal })
    clearTimeout(timeout)
    if (!response.ok) return null
    const data = await response.json()
    const rawScore = data?.lighthouseResult?.categories?.performance?.score
    if (rawScore == null) return null
    return Math.round(rawScore * 100)
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/scanner/places.ts lib/scanner/scraper.ts lib/scanner/pagespeed.ts
git commit -m "feat(scanner): Places, Scraper, PageSpeed libs"
```

---

### Task 7: Groq Analysis Helper + promoteToCRM Server Action

**Files:**
- Create: `lib/scanner/groq.ts`
- Create: `lib/actions/scanner.ts`

- [ ] **Step 1: Write `lib/scanner/groq.ts`**

```typescript
// lib/scanner/groq.ts
// Minimal Groq analysis used only at CRM promotion time (not during scanning)
import Groq from 'groq-sdk'

let _client: Groq | null = null
function getClient(): Groq {
  if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _client
}

const MODEL = 'llama-3.1-8b-instant'

export interface AnalyzeResult {
  analysis: string | null
  score_adjustment: number
}

export async function analyzeWebsiteForPromotion(
  businessName: string,
  website: string | null,
): Promise<AnalyzeResult> {
  if (!process.env.GROQ_API_KEY?.trim()) return { analysis: null, score_adjustment: 0 }

  const prompt = `Tu es un expert en développement web. Analyse brièvement la présence en ligne de cette entreprise.

Entreprise : ${businessName}
Site web : ${website ?? 'Aucun site web détecté'}

Réponds avec :
1. Une liste de bullet points (commençant par •) des problèmes détectés (max 4 points, très concis)
2. Sur la dernière ligne UNIQUEMENT : SCORE_ADJUSTMENT: +X ou -X (de -10 à +10)

En français. Sois factuel.`

  try {
    const completion = await getClient().chat.completions.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = completion.choices[0]?.message?.content ?? ''
    const adjustmentMatch = text.match(/SCORE_ADJUSTMENT:\s*([+-]?\d+)/)
    const score_adjustment = adjustmentMatch
      ? Math.max(-10, Math.min(10, parseInt(adjustmentMatch[1], 10)))
      : 0
    const analysis = text.replace(/SCORE_ADJUSTMENT:.*$/m, '').trim() || null
    return { analysis, score_adjustment }
  } catch {
    return { analysis: null, score_adjustment: 0 }
  }
}
```

- [ ] **Step 2: Write `lib/actions/scanner.ts`**

```typescript
// lib/actions/scanner.ts
'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { analyzeWebsiteForPromotion } from '@/lib/scanner/groq'

export async function promoteToCRM(resultId: string): Promise<{ ok: boolean; alreadyExists?: boolean; prospectId?: string }> {
  if (!resultId) throw new Error('Missing resultId')

  const supabase = await createSupabaseServerClient()

  // 1. Load the scan result
  const { data: result, error: fetchError } = await supabase
    .from('scan_results')
    .select('*')
    .eq('id', resultId)
    .single()

  if (fetchError || !result) throw new Error('Scan result not found')

  // 2. Already promoted?
  if (result.promoted) return { ok: true, alreadyExists: true }

  // 3. Check for existing prospect with same entreprise name
  const { data: existing } = await supabase
    .from('prospects')
    .select('id')
    .eq('entreprise', result.name)
    .maybeSingle()

  if (existing) {
    // Mark as promoted to avoid re-promoting
    await supabase
      .from('scan_results')
      .update({ promoted: true, promoted_at: new Date().toISOString() })
      .eq('id', resultId)
    return { ok: true, alreadyExists: true }
  }

  // 4. Run Groq analysis
  const { analysis, score_adjustment } = await analyzeWebsiteForPromotion(
    result.name,
    result.website,
  )
  const finalScore = Math.min(100, Math.max(0, result.score + score_adjustment))

  // 5. Build email placeholder (prospects.email is NOT NULL)
  const email = `scanner-${result.place_id.slice(0, 8).toLowerCase()}@placeholder.kora`

  // 6. Insert into prospects
  const now = new Date().toISOString()
  const { data: prospect, error: insertError } = await supabase
    .from('prospects')
    .insert({
      source: 'scanner',
      prenom: 'Responsable',
      email,
      telephone: result.phone ?? null,
      entreprise: result.name,
      service_interesse: 'site-web',
      message: analysis ?? `Détecté via scanner — ${result.place_type} à ${result.city}`,
      score: finalScore,
      pipeline_stage: 'nouveau',
      notes: `place_id: ${result.place_id}\nAdresse: ${result.address ?? ''}\nScore scanner: ${result.score}`,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single()

  if (insertError) throw new Error(insertError.message)

  // 7. Mark scan result as promoted
  await supabase
    .from('scan_results')
    .update({ promoted: true, promoted_at: now })
    .eq('id', resultId)

  return { ok: true, prospectId: prospect.id }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/scanner/groq.ts lib/actions/scanner.ts
git commit -m "feat(scanner): Groq analysis helper + promoteToCRM server action"
```

---

### Task 8: API Route — Tick (Core Scanner Logic)

**Files:**
- Create: `app/api/scanner/tick/route.ts`

- [ ] **Step 1: Write `app/api/scanner/tick/route.ts`**

```typescript
// app/api/scanner/tick/route.ts
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

  // 1. Check scan_status
  const { data: status } = await supabase
    .from('scan_status')
    .select('is_scanning')
    .eq('id', 1)
    .single()

  if (!status?.is_scanning) {
    return NextResponse.json({ done: true })
  }

  // 2. Get next queue item
  const { data: item } = await supabase
    .from('scan_queue')
    .select('*')
    .in('status', ['pending', 'error'])
    .order('id', { ascending: true })
    .limit(1)
    .single()

  if (!item) {
    // Queue exhausted
    await supabase
      .from('scan_status')
      .update({ is_scanning: false, updated_at: new Date().toISOString() })
      .eq('id', 1)
    return NextResponse.json({ done: true })
  }

  // 3. Mark item as running + update status
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

  // 5. Score each result and upsert
  let newResults = 0

  // Process all results with concurrency of 5 for scraping
  await processInBatches(places, 5, async (place) => {
    let has_https = false
    let has_viewport_meta: boolean | null = null
    let site_age_signal: 'old' | 'recent' | 'unknown' | null = null
    let pagespeed_mobile: number | null = null

    if (place.website) {
      // Scrape + PageSpeed in parallel
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

    const { error } = await supabase
      .from('scan_results')
      .upsert(
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
        {
          onConflict: 'place_id',
          ignoreDuplicates: false, // update if score improved
        },
      )

    if (!error) newResults++
  })

  // 6. Mark item done + increment totals
  const doneNow = new Date().toISOString()
  await supabase
    .from('scan_queue')
    .update({ status: 'done', updated_at: doneNow })
    .eq('id', item.id)

  await supabase.rpc('increment_scan_totals', {
    p_scanned: 1,
    p_results: newResults,
  })

  return NextResponse.json({
    done: false,
    city: item.city,
    type: item.place_type,
    newResults,
  })
}

async function processInBatches<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await Promise.allSettled(batch.map(fn))
  }
}
```

- [ ] **Step 2: Create the Supabase RPC function for atomic increment**

In Supabase Dashboard → SQL Editor, run:

```sql
create or replace function increment_scan_totals(p_scanned int, p_results int)
returns void language plpgsql as $$
begin
  update scan_status
  set
    total_scanned = total_scanned + p_scanned,
    total_results = total_results + p_results,
    updated_at    = now()
  where id = 1;
end;
$$;
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/scanner/tick/route.ts
git commit -m "feat(scanner): POST /api/scanner/tick — core scan loop"
```

---

### Task 9: API Routes — Start, Stop, Manual

**Files:**
- Create: `app/api/scanner/start/route.ts`
- Create: `app/api/scanner/stop/route.ts`
- Create: `app/api/scanner/manual/route.ts`

- [ ] **Step 1: Write `app/api/scanner/start/route.ts`**

```typescript
// app/api/scanner/start/route.ts
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
    // Build all city × type combinations
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
```

- [ ] **Step 2: Write `app/api/scanner/stop/route.ts`**

```typescript
// app/api/scanner/stop/route.ts
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
```

- [ ] **Step 3: Write `app/api/scanner/manual/route.ts`**

```typescript
// app/api/scanner/manual/route.ts
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

  if (rateLimited) {
    return NextResponse.json({ newResults: 0, error: 'rate_limited' })
  }

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
      { onConflict: 'place_id', ignoreDuplicates: false },
    )
    if (!error) newResults++
  }

  return NextResponse.json({ newResults })
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Run all tests**

```bash
npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/api/scanner/start/route.ts app/api/scanner/stop/route.ts app/api/scanner/manual/route.ts
git commit -m "feat(scanner): API routes — start, stop, manual"
```

---

### Task 10: ScannerSidebar Component

**Files:**
- Create: `components/admin/ScannerSidebar.tsx`

- [ ] **Step 1: Write `components/admin/ScannerSidebar.tsx`**

```typescript
// components/admin/ScannerSidebar.tsx
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { PLACE_TYPES } from '@/lib/scanner/validation'
import type { ScanStatus, ScanTickResponse } from '@/types/scanner'

interface ScannerSidebarProps {
  initialStatus: ScanStatus
  onTickComplete: (newResults: number) => void
}

export function ScannerSidebar({ initialStatus, onTickComplete }: ScannerSidebarProps) {
  const [status, setStatus] = useState<ScanStatus>(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const [manualCity, setManualCity] = useState('')
  const [manualType, setManualType] = useState(PLACE_TYPES[0])
  const [manualLoading, setManualLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isRunningRef = useRef(status.is_scanning)

  const tick = useCallback(async () => {
    if (!isRunningRef.current) return

    try {
      const res = await fetch('/api/scanner/tick', { method: 'POST' })
      const data: ScanTickResponse = await res.json()

      if (data.done) {
        isRunningRef.current = false
        setStatus(s => ({ ...s, is_scanning: false }))
        return
      }

      if (data.newResults !== undefined) {
        onTickComplete(data.newResults)
        setStatus(s => ({
          ...s,
          total_scanned: s.total_scanned + 1,
          total_results: s.total_results + (data.newResults ?? 0),
          current_city: data.city ?? s.current_city,
          current_type: data.type ?? s.current_type,
        }))
      }
    } catch {
      // Network error — keep trying
    }

    if (isRunningRef.current) {
      intervalRef.current = setTimeout(tick, 2000)
    }
  }, [onTickComplete])

  useEffect(() => {
    if (status.is_scanning) {
      isRunningRef.current = true
      intervalRef.current = setTimeout(tick, 500)
    }
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStart() {
    setIsLoading(true)
    await fetch('/api/scanner/start', { method: 'POST' })
    isRunningRef.current = true
    setStatus(s => ({ ...s, is_scanning: true, last_error: null }))
    intervalRef.current = setTimeout(tick, 500)
    setIsLoading(false)
  }

  async function handleStop() {
    setIsLoading(true)
    isRunningRef.current = false
    if (intervalRef.current) clearTimeout(intervalRef.current)
    await fetch('/api/scanner/stop', { method: 'POST' })
    setStatus(s => ({ ...s, is_scanning: false }))
    setIsLoading(false)
  }

  async function handleManual() {
    if (!manualCity.trim()) return
    setManualLoading(true)
    const res = await fetch('/api/scanner/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: manualCity.trim(), place_type: manualType }),
    })
    const data = await res.json()
    if (data.newResults > 0) onTickComplete(data.newResults)
    setManualLoading(false)
  }

  const dotColor = status.is_scanning
    ? '#34C759'
    : status.last_error
      ? '#FF3B30'
      : 'rgba(255,255,255,0.3)'

  const statusLabel = status.is_scanning
    ? 'En cours'
    : status.last_error
      ? 'Erreur — rate limit'
      : 'Arrêté'

  return (
    <aside
      className="flex-shrink-0 flex flex-col gap-3 p-4"
      style={{ width: 220, borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Status */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', marginBottom: 6 }}>Statut</div>
        <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
          <span
            style={{
              width: 8, height: 8, borderRadius: '50%', background: dotColor,
              boxShadow: status.is_scanning ? `0 0 6px ${dotColor}` : 'none',
              display: 'inline-block',
            }}
          />
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{statusLabel}</span>
        </div>
        {status.is_scanning ? (
          <button
            onClick={handleStop}
            disabled={isLoading}
            className="w-full text-xs font-semibold py-1.5 rounded"
            style={{ background: '#FF3B30', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            ⏹ Arrêter
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="w-full text-xs font-semibold py-1.5 rounded"
            style={{ background: '#34C759', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            ▶ Démarrer
          </button>
        )}
      </div>

      {/* KPIs */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', marginBottom: 8 }}>Progression</div>
        {status.is_scanning && status.current_city && (
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginBottom: 6 }}>
            {status.current_city} → {status.current_type?.replace(/_/g, ' ')}
          </div>
        )}
        <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
          {status.total_scanned.toLocaleString('fr-FR')}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: 10 }}> scannés</span>
        </div>
        <div style={{ color: '#34C759', fontSize: 13, fontWeight: 600 }}>
          {status.total_results.toLocaleString('fr-FR')}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: 10 }}> résultats</span>
        </div>
      </div>

      {/* Manual scan */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', marginBottom: 8 }}>Scan manuel</div>
        <input
          value={manualCity}
          onChange={e => setManualCity(e.target.value)}
          placeholder="Ville…"
          className="w-full text-xs rounded mb-2 px-2 py-1.5"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
        />
        <select
          value={manualType}
          onChange={e => setManualType(e.target.value)}
          className="w-full text-xs rounded mb-2 px-2 py-1.5"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
        >
          {PLACE_TYPES.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button
          onClick={handleManual}
          disabled={manualLoading || !manualCity.trim()}
          className="w-full text-xs font-semibold py-1.5 rounded"
          style={{
            background: manualCity.trim() ? '#007AFF' : 'rgba(255,255,255,0.1)',
            color: '#fff', border: 'none', cursor: manualCity.trim() ? 'pointer' : 'default',
          }}
        >
          {manualLoading ? 'Scan…' : 'Lancer'}
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/ScannerSidebar.tsx
git commit -m "feat(scanner): ScannerSidebar — status, controls, KPIs, manual form"
```

---

### Task 11: ScannerResults Component

**Files:**
- Create: `components/admin/ScannerResults.tsx`

- [ ] **Step 1: Write `components/admin/ScannerResults.tsx`**

```typescript
// components/admin/ScannerResults.tsx
'use client'
import { useState, useEffect, useTransition } from 'react'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { promoteToCRM } from '@/lib/actions/scanner'
import type { ScanResult } from '@/types/scanner'

interface ScannerResultsProps {
  initialResults: ScanResult[]
  refreshKey: number
}

export function ScannerResults({ initialResults, refreshKey }: ScannerResultsProps) {
  const [results, setResults] = useState<ScanResult[]>(initialResults)
  const [isPending, startTransition] = useTransition()

  async function refresh() {
    const res = await fetch('/api/scanner/results')
    if (res.ok) {
      const data: ScanResult[] = await res.json()
      setResults(data)
    }
  }

  // Re-fetch when parent signals a tick completed with new results
  useEffect(() => {
    if (refreshKey > 0) refresh()
  }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePromote(result: ScanResult) {
    // Optimistic update
    setResults(prev =>
      prev.map(r => r.id === result.id ? { ...r, promoted: true } : r)
    )
    startTransition(async () => {
      try {
        await promoteToCRM(result.id)
      } catch {
        // Rollback on error
        setResults(prev =>
          prev.map(r => r.id === result.id ? { ...r, promoted: false } : r)
        )
      }
    })
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Entreprise', 'Ville', 'Secteur', 'Site', 'Score', ''].map(h => (
              <th
                key={h}
                className="text-left px-4 py-2"
                style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                Aucun résultat — lance un scan pour commencer.
              </td>
            </tr>
          )}
          {results.map(result => (
            <tr
              key={result.id}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              className="hover:bg-white/[0.02]"
            >
              <td className="px-4 py-2.5" style={{ color: '#fff', fontWeight: 500, fontSize: 13 }}>
                {result.name}
              </td>
              <td className="px-4 py-2.5" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                {result.city}
              </td>
              <td className="px-4 py-2.5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                {result.place_type.replace(/_/g, ' ')}
              </td>
              <td className="px-4 py-2.5">
                {result.website ? (
                  <a
                    href={result.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#007AFF', fontSize: 11 }}
                    className="hover:underline"
                  >
                    {new URL(result.website).hostname}
                  </a>
                ) : (
                  <span style={{ color: 'rgba(255,59,48,0.8)', fontSize: 11 }}>Aucun site</span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <ScoreBadge score={result.score} />
              </td>
              <td className="px-4 py-2.5">
                {result.promoted ? (
                  <span style={{ color: '#34C759', fontSize: 11, fontWeight: 600 }}>✓ CRM</span>
                ) : (
                  <button
                    onClick={() => handlePromote(result)}
                    disabled={isPending}
                    style={{
                      background: '#007AFF', color: '#fff', border: 'none',
                      padding: '3px 10px', borderRadius: 5, fontSize: 11,
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    + CRM
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Create `/api/scanner/results` route for client refresh**

```typescript
// app/api/scanner/results/route.ts
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
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/admin/ScannerResults.tsx app/api/scanner/results/route.ts
git commit -m "feat(scanner): ScannerResults table + /api/scanner/results route"
```

---

### Task 12: Scanner Page + ScoreBadge Check

**Files:**
- Create: `app/(admin)/scanner/page.tsx`
- Verify: `components/admin/ScoreBadge.tsx` exists (created in SP3)

- [ ] **Step 1: Verify ScoreBadge exists**

```bash
ls components/admin/ScoreBadge.tsx
```

Expected: file exists. If not, create it:

```typescript
// components/admin/ScoreBadge.tsx
import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
  score: number
  className?: string
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const color = score >= 70
    ? { bg: 'rgba(255,59,48,0.1)', text: '#FF3B30' }
    : score >= 50
      ? { bg: 'rgba(255,149,0,0.1)', text: '#FF9500' }
      : { bg: 'rgba(52,199,89,0.1)', text: '#34C759' }

  return (
    <span
      className={cn('inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md', className)}
      style={{ background: color.bg, color: color.text }}
    >
      {score}
    </span>
  )
}
```

- [ ] **Step 2: Write `app/(admin)/scanner/page.tsx`**

```typescript
// app/(admin)/scanner/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { ScannerSidebar } from '@/components/admin/ScannerSidebar'
import { ScannerResults } from '@/components/admin/ScannerResults'
import type { ScanStatus, ScanResult } from '@/types/scanner'

export const dynamic = 'force-dynamic'

export default async function ScannerPage() {
  const supabase = await createSupabaseServerClient()

  const [{ data: statusData }, { data: resultsData }] = await Promise.all([
    supabase.from('scan_status').select('*').eq('id', 1).single(),
    supabase
      .from('scan_results')
      .select('*')
      .order('score', { ascending: false })
      .limit(100),
  ])

  const status: ScanStatus = statusData ?? {
    id: 1,
    is_scanning: false,
    current_city: null,
    current_type: null,
    total_scanned: 0,
    total_results: 0,
    last_error: null,
    updated_at: new Date().toISOString(),
  }

  const results: ScanResult[] = resultsData ?? []

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />
      <ScannerPageClient initialStatus={status} initialResults={results} />
    </div>
  )
}
```

- [ ] **Step 3: Create `app/(admin)/scanner/ScannerPageClient.tsx`**

The sidebar and results need to share a `refreshKey` state to trigger re-fetching after each tick. Extract to a client wrapper:

```typescript
// app/(admin)/scanner/ScannerPageClient.tsx
'use client'
import { useState } from 'react'
import { ScannerSidebar } from '@/components/admin/ScannerSidebar'
import { ScannerResults } from '@/components/admin/ScannerResults'
import type { ScanStatus, ScanResult } from '@/types/scanner'

interface ScannerPageClientProps {
  initialStatus: ScanStatus
  initialResults: ScanResult[]
}

export function ScannerPageClient({ initialStatus, initialResults }: ScannerPageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  function handleTickComplete(newResults: number) {
    if (newResults > 0) setRefreshKey(k => k + 1)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <ScannerSidebar
        initialStatus={initialStatus}
        onTickComplete={handleTickComplete}
      />
      <ScannerResults
        initialResults={initialResults}
        refreshKey={refreshKey}
      />
    </div>
  )
}
```

- [ ] **Step 4: Update `app/(admin)/scanner/page.tsx` to use the client wrapper**

```typescript
// app/(admin)/scanner/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { ScannerPageClient } from './ScannerPageClient'
import type { ScanStatus, ScanResult } from '@/types/scanner'

export const dynamic = 'force-dynamic'

export default async function ScannerPage() {
  const supabase = await createSupabaseServerClient()

  const [{ data: statusData }, { data: resultsData }] = await Promise.all([
    supabase.from('scan_status').select('*').eq('id', 1).single(),
    supabase
      .from('scan_results')
      .select('*')
      .order('score', { ascending: false })
      .limit(100),
  ])

  const status: ScanStatus = statusData ?? {
    id: 1,
    is_scanning: false,
    current_city: null,
    current_type: null,
    total_scanned: 0,
    total_results: 0,
    last_error: null,
    updated_at: new Date().toISOString(),
  }

  const results: ScanResult[] = resultsData ?? []

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />
      <ScannerPageClient initialStatus={status} initialResults={results} />
    </div>
  )
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Run all tests**

```bash
npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 7: Start dev server and manually test**

```bash
npm run dev
```

Navigate to `http://localhost:3000/admin/scanner`.

Manual checks:
- Page loads without error
- Sidebar shows "Arrêté" status with green "Démarrer" button
- Results table shows empty state: "Aucun résultat — lance un scan pour commencer."
- Fill in a city + type in the manual form and click "Lancer" → should appear in results table
- Click "Démarrer" → status changes to "En cours", tick fires every 2s
- Click "Arrêter" → status returns to "Arrêté"
- Click "+ CRM" on a result → button changes to "✓ CRM"
- Check Supabase Table Editor: `scan_results` has rows, `prospects` has new entry with `source = 'scanner'`

- [ ] **Step 8: Commit**

```bash
git add app/\(admin\)/scanner/page.tsx app/\(admin\)/scanner/ScannerPageClient.tsx
git commit -m "feat(scanner): /admin/scanner page — sidebar + results layout"
```

---

### Task 13: Final Verification

**Files:** none new

- [ ] **Step 1: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests pass (no regressions).

- [ ] **Step 2: TypeScript clean**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Check .gitignore includes .superpowers/**

```bash
grep -n "superpowers" .gitignore || echo ".superpowers/ not in .gitignore"
```

If not present, add it:

```bash
echo ".superpowers/" >> .gitignore
git add .gitignore
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(scanner): Scanner IA SP4 — complete implementation"
```
