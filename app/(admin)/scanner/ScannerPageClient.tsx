// app/(admin)/scanner/ScannerPageClient.tsx
'use client'
import { useState } from 'react'
import { ScannerSidebar } from '@/components/admin/ScannerSidebar'
import { ScannerResults } from '@/components/admin/ScannerResults'
import type { ScanStatus, ScanResult } from '@/types/scanner'

interface ScannerPageClientProps {
  initialStatus: ScanStatus
  initialResults: ScanResult[]
}

export function ScannerPageClient({ initialStatus, initialResults }: ScannerPageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  function handleTickComplete(newResults: number) {
    if (newResults > 0) setRefreshKey(k => k + 1)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <ScannerSidebar
        initialStatus={initialStatus}
        onTickComplete={handleTickComplete}
      />
      <ScannerResults
        initialResults={initialResults}
        refreshKey={refreshKey}
      />
    </div>
  )
}
