// lib/scanner/groq.ts
// Minimal Groq analysis — called only at CRM promotion time (not during scanning)
import Groq from 'groq-sdk'

let _client: Groq | null = null
function getClient(): Groq {
  if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _client
}

const MODEL = 'llama-3.1-8b-instant'

export interface AnalyzeResult {
  analysis: string | null
  score_adjustment: number
}

export async function analyzeWebsiteForPromotion(
  businessName: string,
  website: string | null,
): Promise<AnalyzeResult> {
  if (!process.env.GROQ_API_KEY?.trim()) return { analysis: null, score_adjustment: 0 }

  const prompt = `Tu es un expert en développement web. Analyse brièvement la présence en ligne de cette entreprise.

Entreprise : ${businessName}
Site web : ${website ?? 'Aucun site web détecté'}

Réponds avec :
1. Une liste de bullet points (commençant par •) des problèmes détectés (max 4 points, très concis)
2. Sur la dernière ligne UNIQUEMENT : SCORE_ADJUSTMENT: +X ou -X (de -10 à +10)

En français. Sois factuel.`

  try {
    const completion = await getClient().chat.completions.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = completion.choices[0]?.message?.content ?? ''
    const adjustmentMatch = text.match(/SCORE_ADJUSTMENT:\s*([+-]?\d+)/)
    const score_adjustment = adjustmentMatch
      ? Math.max(-10, Math.min(10, parseInt(adjustmentMatch[1], 10)))
      : 0
    const analysis = text.replace(/SCORE_ADJUSTMENT:.*$/m, '').trim() || null
    return { analysis, score_adjustment }
  } catch {
    return { analysis: null, score_adjustment: 0 }
  }
}
