'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { validateProjectForm } from '@/lib/actions/project-validation'
import type { ProjectFormData } from '@/types/crm'

export async function upsertProject(data: ProjectFormData): Promise<{ id: string }> {
  if (!validateProjectForm(data)) throw new Error('Invalid project data')
  const supabase = await createSupabaseServerClient()
  const now = new Date().toISOString()
  const fields = {
    prospect_id: data.prospect_id ?? null,
    client_nom:  data.client_nom,
    service:     data.service,
    montant:     data.montant   ?? null,
    statut:      data.statut,
    deadline:    data.deadline  ?? null,
    notes:       data.notes     ?? null,
    updated_at:  now,
  }
  if (data.id) {
    const { error } = await supabase.from('projects').update(fields).eq('id', data.id)
    if (error) throw new Error(error.message)
    return { id: data.id }
  }
  const { data: row, error } = await supabase
    .from('projects')
    .insert(fields)
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return { id: row.id }
}

export async function deleteProject(id: string): Promise<void> {
  if (!id) throw new Error('Invalid id')
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
