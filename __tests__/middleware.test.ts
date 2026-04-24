/**
 * Testing redirect logic without instantiating the real Next.js middleware.
 * The decision logic is extracted into a pure testable helper.
 */
import { shouldRedirectToLogin } from '@/lib/auth-middleware'

describe('shouldRedirectToLogin', () => {
  it('retourne true pour /admin/dashboard sans session', () => {
    expect(shouldRedirectToLogin('/admin/dashboard', null)).toBe(true)
  })

  it('retourne true pour /admin/prospects sans session', () => {
    expect(shouldRedirectToLogin('/admin/prospects', null)).toBe(true)
  })

  it('retourne false pour /admin/dashboard avec session', () => {
    expect(shouldRedirectToLogin('/admin/dashboard', 'user-id-123')).toBe(false)
  })

  it('retourne false pour / (route publique) sans session', () => {
    expect(shouldRedirectToLogin('/', null)).toBe(false)
  })

  it('retourne false pour /services sans session', () => {
    expect(shouldRedirectToLogin('/services', null)).toBe(false)
  })

  it('retourne false pour /login sans session', () => {
    expect(shouldRedirectToLogin('/login', null)).toBe(false)
  })
})
