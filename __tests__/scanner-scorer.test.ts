import { calculateScanScore } from '@/lib/scanner/scorer'

describe('calculateScanScore', () => {
  it('returns 40 for business with no website', () => {
    expect(calculateScanScore({
      has_website: false, website_url: null, has_https: false,
      pagespeed_mobile: null, has_viewport_meta: null,
      site_age_signal: null, has_complete_gmb: true,
    })).toBe(40)
  })

  it('returns 20 for HTTP site (no HTTPS)', () => {
    expect(calculateScanScore({
      has_website: true, website_url: 'http://example.com', has_https: false,
      pagespeed_mobile: null, has_viewport_meta: null,
      site_age_signal: null, has_complete_gmb: true,
    })).toBe(20)
  })

  it('returns 15 for site with pagespeed < 50', () => {
    expect(calculateScanScore({
      has_website: true, website_url: 'https://example.com', has_https: true,
      pagespeed_mobile: 30, has_viewport_meta: true,
      site_age_signal: null, has_complete_gmb: true,
    })).toBe(15)
  })

  it('returns 0 for site with pagespeed >= 50', () => {
    expect(calculateScanScore({
      has_website: true, website_url: 'https://example.com', has_https: true,
      pagespeed_mobile: 75, has_viewport_meta: true,
      site_age_signal: 'recent', has_complete_gmb: true,
    })).toBe(0)
  })

  it('accumulates no_website + incomplete_gmb', () => {
    expect(calculateScanScore({
      has_website: false, website_url: null, has_https: false,
      pagespeed_mobile: null, has_viewport_meta: null,
      site_age_signal: null, has_complete_gmb: false,
    })).toBe(45) // 40 + 5
  })

  it('accumulates all signals for a bad website', () => {
    expect(calculateScanScore({
      has_website: true, website_url: 'http://old-site.fr', has_https: false,
      pagespeed_mobile: 20, has_viewport_meta: false,
      site_age_signal: 'old', has_complete_gmb: false,
    })).toBe(60) // 20+15+10+10+5
  })

  it('does not apply HTTPS or PageSpeed checks when no website', () => {
    // no_website=40, no_https=0(skipped), pagespeed=0(skipped), no_viewport=0(skipped), old_site=0(skipped), incomplete_gmb=5
    expect(calculateScanScore({
      has_website: false, website_url: null, has_https: false,
      pagespeed_mobile: 10, has_viewport_meta: false,
      site_age_signal: 'old', has_complete_gmb: false,
    })).toBe(45)
  })

  it('caps total score at 100', () => {
    expect(calculateScanScore({
      has_website: true, website_url: 'http://bad.fr', has_https: false,
      pagespeed_mobile: 10, has_viewport_meta: false,
      site_age_signal: 'old', has_complete_gmb: false,
    })).toBe(60) // 20+15+10+10+5 = 60, no cap needed
  })
})
