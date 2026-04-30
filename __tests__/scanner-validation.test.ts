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
