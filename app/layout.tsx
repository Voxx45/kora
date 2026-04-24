import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KORA — Studio digital local',
  description: 'Création de site web, identité visuelle et référencement local pour TPE et PME.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
