import { createSupabaseServerClient } from '@/lib/supabase-server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { KanbanBoard } from '@/components/admin/KanbanBoard'
import type { Prospect } from '@/types/crm'

export default async function PipelinePage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('prospects')
    .select('*')
    .order('score', { ascending: false })

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />
      <div className="flex-1 overflow-hidden p-5">
        <KanbanBoard initialProspects={(data ?? []) as Prospect[]} />
      </div>
    </div>
  )
}
