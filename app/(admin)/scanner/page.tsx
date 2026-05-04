// app/(admin)/scanner/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { ScannerPageClient } from './ScannerPageClient'
import { PAGE_SIZE } from '@/lib/scanner/results-url'
import type { ScanStatus, ScanResult } from '@/types/scanner'

export const dynamic = 'force-dynamic'

export default async function ScannerPage() {
  const supabase = await createSupabaseServerClient()

  const [{ data: statusData }, { data: resultsData, count: resultsCount }] = await Promise.all([
    supabase.from('scan_status').select('*').eq('id', 1).single(),
    supabase
      .from('scan_results')
      .select('*', { count: 'exact' })
      .order('score', { ascending: false })
      .range(0, PAGE_SIZE - 1),
  ])

  const status: ScanStatus = statusData ?? {
    id: 1,
    is_scanning: false,
    current_city: null,
    current_type: null,
    total_scanned: 0,
    total_results: 0,
    last_error: null,
    updated_at: new Date().toISOString(),
  }

  const results: ScanResult[] = resultsData ?? []

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />
      <ScannerPageClient initialStatus={status} initialResults={results} initialTotal={resultsCount ?? results.length} />
    </div>
  )
}
