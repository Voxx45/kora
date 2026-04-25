export interface ContactPayload {
  prenom: string
  email: string
  telephone?: string
  entreprise?: string
  service: string
  message: string
}

export function validateContactPayload(body: unknown): body is ContactPayload {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.prenom === 'string' && b.prenom.trim().length > 0 && b.prenom.length <= 100 &&
    typeof b.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) && b.email.length <= 254 &&
    typeof b.service === 'string' && b.service.trim().length > 0 && b.service.length <= 100 &&
    typeof b.message === 'string' && b.message.trim().length > 0 && b.message.length <= 5000
  )
}
