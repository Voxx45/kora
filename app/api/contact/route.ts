import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { validateContactPayload } from '@/lib/contact-validation'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!validateContactPayload(body)) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  const { prenom, email, telephone, entreprise, service, message } = body

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `[KORA] Nouveau message de ${prenom} — ${service}`,
      html: `
        <h2>Nouveau message via le site KORA</h2>
        <p><strong>Prénom :</strong> ${prenom}</p>
        <p><strong>Email :</strong> ${email}</p>
        ${telephone ? `<p><strong>Téléphone :</strong> ${telephone}</p>` : ''}
        ${entreprise ? `<p><strong>Entreprise :</strong> ${entreprise}</p>` : ''}
        <p><strong>Service :</strong> ${service}</p>
        <hr />
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] sendMail error', err)
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 })
  }
}
