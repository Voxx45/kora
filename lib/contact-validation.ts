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
    typeof b.prenom === 'string' && b.prenom.trim().length > 0 &&
    typeof b.email === 'string' && b.email.includes('@') &&
    typeof b.service === 'string' && b.service.trim().length > 0 &&
    typeof b.message === 'string' && b.message.trim().length > 0
  )
}
