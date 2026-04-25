export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function validateChatMessages(messages: unknown): messages is ChatMessage[] {
  if (!Array.isArray(messages)) return false
  if (messages.length === 0 || messages.length > 10) return false
  return messages.every(
    m =>
      m !== null &&
      typeof m === 'object' &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.trim().length > 0
  )
}
