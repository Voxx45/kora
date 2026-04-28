'use server'
import nodemailer from 'nodemailer'

export async function testSmtp(): Promise<{ success: boolean; error?: string }> {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_PORT } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return { success: false, error: 'Variables SMTP non configurées (SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM)' }
  }
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
    await transporter.sendMail({
      from: SMTP_FROM,
      to: SMTP_USER,
      subject: '[KORA] Test SMTP',
      text: 'Si vous recevez ce message, la configuration SMTP fonctionne correctement.',
    })
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}

export async function testGroq(): Promise<{ success: boolean; error?: string }> {
  if (!process.env.GROQ_API_KEY) {
    return { success: false, error: 'GROQ_API_KEY non configurée' }
  }
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: 'Reply with just "ok"' }],
        max_tokens: 5,
      }),
    })
    if (!res.ok) return { success: false, error: `Groq API HTTP ${res.status}` }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' }
  }
}
