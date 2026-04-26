'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const WELCOME: Message = {
  role: 'assistant',
  content: "Bonjour ! 👋 Je suis l'assistant KORA. Vous avez une question sur nos services ou nos tarifs ?",
}

export function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    // Add empty assistant placeholder to stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Service indisponible')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: accumulated },
        ])
      }
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Service temporairement indisponible. Utilisez le formulaire ci-contre.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const isMaxMessages = messages.length >= 21

  return (
    <div
      className="flex flex-col rounded-[20px] overflow-hidden h-full min-h-[420px]"
      style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #FCD34D, #F97316)' }}
        >
          ✦
        </div>
        <div>
          <p className="text-[12px] font-bold text-[#1C1C1E]">Assistant KORA</p>
          <p className="text-[10px]" style={{ color: '#8E8E93' }}>Posez-moi vos questions</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] px-3.5 py-2.5 rounded-[14px] text-[12px] leading-[1.6]',
                msg.role === 'user'
                  ? 'bg-[#1C1C1E] text-white rounded-br-[4px]'
                  : 'bg-white text-[#1C1C1E] rounded-bl-[4px]'
              )}
              style={msg.role === 'assistant' ? { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } : undefined}
            >
              {msg.content || (loading && i === messages.length - 1 ? '…' : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        className="px-3 py-3 flex items-center gap-2 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isMaxMessages ? 'Limite atteinte — utilisez le formulaire' : 'Votre question…'}
          disabled={loading || isMaxMessages}
          className="flex-1 text-[12px] px-3.5 py-2 rounded-[10px] border border-black/10 bg-white text-[#1C1C1E] outline-none focus:border-black/30 disabled:opacity-50"
        />
        <button
          onClick={() => void handleSend()}
          disabled={loading || !input.trim() || isMaxMessages}
          className="text-[11px] font-semibold px-3.5 py-2 rounded-[10px] bg-[#1C1C1E] text-white disabled:opacity-40 transition-opacity"
        >
          Envoyer
        </button>
      </div>
    </div>
  )
}
