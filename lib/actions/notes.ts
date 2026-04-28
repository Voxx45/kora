'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function saveGlobalNote(content: string): Promise<void> {
  if (typeof content !== 'string') throw new Error('Invalid content')
  const supabase = await createSupabaseServerClient()
  const { data: existing } = await supabase
    .from('global_notes')
    .select('id')
    .limit(1)
    .maybeSingle()
  if (existing) {
    const { error } = await supabase
      .from('global_notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('global_notes').insert({ content })
    if (error) throw new Error(error.message)
  }
}
