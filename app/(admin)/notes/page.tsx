import { createSupabaseServerClient } from '@/lib/supabase-server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { NotesClient } from './NotesClient'

export default async function NotesPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('global_notes')
    .select('content')
    .limit(1)
    .maybeSingle()

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />
      <NotesClient initialContent={data?.content ?? ''} />
    </div>
  )
}
