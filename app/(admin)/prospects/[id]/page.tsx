import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { FicheClient } from './FicheClient'
import type { Prospect } from '@/types/crm'

interface Props { params: Promise<{ id: string }> }

export default async function FichePage({ params }: Props) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('prospects').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar
        actions={
          <Link
            href="/admin/prospects"
            className="text-[11px] px-3 py-1.5 rounded-[10px]"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
          >
            ← Retour
          </Link>
        }
      />
      <FicheClient prospect={data as Prospect} />
    </div>
  )
}
