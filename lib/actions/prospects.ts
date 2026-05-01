'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { validateProspectForm, validatePipelineStage } from '@/lib/actions/prospect-validation'
import type { PipelineStage, ProspectFormData } from '@/types/crm'

export async function updateProspectStage(id: string, stage: PipelineStage): Promise<void> {
  if (!id || !validatePipelineStage(stage)) throw new Error('Invalid input')
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('prospects')
    .update({ pipeline_stage: stage, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function upsertProspect(data: ProspectFormData): Promise<{ id: string }> {
  if (!validateProspectForm(data)) throw new Error('Invalid prospect data')
  const supabase = await createSupabaseServerClient()
  const now = new Date().toISOString()
  const fields = {
    prenom:            data.prenom,
    email:             data.email,
    telephone:         data.telephone         ?? null,
    entreprise:        data.entreprise        ?? null,
    service_interesse: data.service_interesse ?? null,
    message:           data.message           ?? null,
    score:             data.score,
    pipeline_stage:    data.pipeline_stage,
    valeur_estimee:    data.valeur_estimee    ?? null,
    next_followup_at:  data.next_followup_at  ?? null,
    notes:             data.notes             ?? null,
    updated_at:        now,
  }
  if (data.id) {
    const { error } = await supabase.from('prospects').update(fields).eq('id', data.id)
    if (error) throw new Error(error.message)
    return { id: data.id }
  }
  const { data: row, error } = await supabase
    .from('prospects')
    .insert({ source: 'manual', ...fields })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return { id: row.id }
}

export async function deleteProspect(id: string): Promise<void> {
  if (!id) throw new Error('Invalid id')
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('prospects').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateProspectNotes(id: string, notes: string): Promise<void> {
  if (!id) throw new Error('Invalid id')
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('prospects')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
