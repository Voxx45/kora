import { KoraNav } from '@/components/KoraNav'
import { KoraFooter } from '@/components/KoraFooter'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F2F2F7' }}>
      <KoraNav />
      <main className="flex-1">{children}</main>
      <KoraFooter />
    </div>
  )
}
