import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ProspectsClient } from './ProspectsClient'
import type { Prospect } from '@/types/crm'

export default async function ProspectsPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('prospects')
    .select('*')
    .order('created_at', { ascending: false })

  return <ProspectsClient prospects={(data ?? []) as Prospect[]} />
}
