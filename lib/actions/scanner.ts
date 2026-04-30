// lib/actions/scanner.ts
'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { analyzeWebsiteForPromotion } from '@/lib/scanner/groq'

export async function promoteToCRM(resultId: string): Promise<{ ok: boolean; alreadyExists?: boolean; prospectId?: string }> {
  if (!resultId) throw new Error('Missing resultId')

  const supabase = await createSupabaseServerClient()

  // 1. Load the scan result
  const { data: result, error: fetchError } = await supabase
    .from('scan_results')
    .select('*')
    .eq('id', resultId)
    .single()

  if (fetchError || !result) throw new Error('Scan result not found')

  // 2. Already promoted?
  if (result.promoted) return { ok: true, alreadyExists: true }

  // 3. Check for existing prospect with same entreprise name
  const { data: existing } = await supabase
    .from('prospects')
    .select('id')
    .eq('entreprise', result.name)
    .maybeSingle()

  if (existing) {
    // Mark as promoted to prevent duplicate attempts
    await supabase
      .from('scan_results')
      .update({ promoted: true, promoted_at: new Date().toISOString() })
      .eq('id', resultId)
    return { ok: true, alreadyExists: true }
  }

  // 4. Run Groq analysis
  const { analysis, score_adjustment } = await analyzeWebsiteForPromotion(
    result.name,
    result.website,
  )
  const finalScore = Math.min(100, Math.max(0, result.score + score_adjustment))

  // 5. Build email placeholder (prospects.email is NOT NULL)
  const email = `scanner-${result.place_id.slice(0, 8).toLowerCase()}@placeholder.kora`

  // 6. Insert into prospects
  const now = new Date().toISOString()
  const { data: prospect, error: insertError } = await supabase
    .from('prospects')
    .insert({
      source: 'scanner',
      prenom: 'Responsable',
      email,
      telephone: result.phone ?? null,
      entreprise: result.name,
      service_interesse: 'site-web',
      message: analysis ?? `Détecté via scanner — ${result.place_type} à ${result.city}`,
      score: finalScore,
      pipeline_stage: 'nouveau',
      notes: `place_id: ${result.place_id}\nAdresse: ${result.address ?? ''}\nScore scanner: ${result.score}`,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single()

  if (insertError) throw new Error(insertError.message)

  // 7. Mark scan result as promoted
  await supabase
    .from('scan_results')
    .update({ promoted: true, promoted_at: now })
    .eq('id', resultId)

  return { ok: true, prospectId: prospect.id }
}
