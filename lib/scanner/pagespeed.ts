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
