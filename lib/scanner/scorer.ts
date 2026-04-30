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
