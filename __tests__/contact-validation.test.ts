import { validateContactPayload } from '@/lib/contact-validation'

describe('validateContactPayload', () => {
  const valid = {
    prenom: 'Marie',
    email: 'marie@example.com',
    service: 'Site web',
    message: 'Bonjour, je cherche un site.',
  }

  it('accepte un payload complet valide', () => {
    expect(validateContactPayload(valid)).toBe(true)
  })

  it('accepte un payload avec champs optionnels', () => {
    expect(validateContactPayload({ ...valid, telephone: '0601020304', entreprise: 'Café du coin' })).toBe(true)
  })

  it('rejette si prenom manquant', () => {
    expect(validateContactPayload({ ...valid, prenom: '' })).toBe(false)
  })

  it('rejette si email sans @', () => {
    expect(validateContactPayload({ ...valid, email: 'invalide' })).toBe(false)
  })

  it('rejette si service manquant', () => {
    expect(validateContactPayload({ ...valid, service: '' })).toBe(false)
  })

  it('rejette si message manquant', () => {
    expect(validateContactPayload({ ...valid, message: '' })).toBe(false)
  })

  it('rejette si payload null', () => {
    expect(validateContactPayload(null)).toBe(false)
  })

  it('rejette si payload non-objet', () => {
    expect(validateContactPayload('string')).toBe(false)
  })
})
