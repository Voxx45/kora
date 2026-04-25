import { validateChatMessages } from '@/lib/chat-validation'

describe('validateChatMessages', () => {
  const validMsg = { role: 'user' as const, content: 'Bonjour' }

  it('accepte un tableau de 1 message valide', () => {
    expect(validateChatMessages([validMsg])).toBe(true)
  })

  it('accepte un tableau de 10 messages', () => {
    const msgs = Array(10).fill(validMsg)
    expect(validateChatMessages(msgs)).toBe(true)
  })

  it('rejette un tableau vide', () => {
    expect(validateChatMessages([])).toBe(false)
  })

  it('rejette plus de 10 messages', () => {
    const msgs = Array(11).fill(validMsg)
    expect(validateChatMessages(msgs)).toBe(false)
  })

  it('rejette si role invalide', () => {
    expect(validateChatMessages([{ role: 'system', content: 'test' }])).toBe(false)
  })

  it('rejette si content vide', () => {
    expect(validateChatMessages([{ role: 'user', content: '' }])).toBe(false)
  })

  it('rejette si non-tableau', () => {
    expect(validateChatMessages('string')).toBe(false)
  })

  it('rejette null', () => {
    expect(validateChatMessages(null)).toBe(false)
  })
})
