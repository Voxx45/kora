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
