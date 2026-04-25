import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { validateChatMessages } from '@/lib/chat-validation'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `Tu es l'assistant KORA, un studio digital local indépendant.
Tu aides les prospects à comprendre nos services et à trouver la bonne solution.
Services : création de site web (dès 800€), identité visuelle (dès 350€),
référencement local (dès 150€/mois), supports print (dès 120€),
maintenance (dès 60€/mois), réseaux sociaux (dès 200€/mois).
Délais : site web 2-4 semaines, identité 1-2 semaines.
Sois chaleureux, direct, honnête. Maximum 3 phrases par réponse.
Si la question est hors périmètre, redirige vers le formulaire de contact.
Réponds toujours en français.`

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { messages } = (body ?? {}) as { messages?: unknown }

  if (!validateChatMessages(messages)) {
    return NextResponse.json({ error: 'Messages invalides' }, { status: 400 })
  }

  if (!process.env.GROQ_API_KEY) {
    console.error('[chat] GROQ_API_KEY not configured')
    return NextResponse.json({ error: 'Service temporairement indisponible' }, { status: 503 })
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 400,
      temperature: 0.7,
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) controller.enqueue(encoder.encode(text))
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('[chat] groq error', err)
    return NextResponse.json({ error: 'Service temporairement indisponible' }, { status: 503 })
  }
}
