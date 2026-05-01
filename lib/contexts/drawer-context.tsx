'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import type { Prospect } from '@/types/crm'
import type { ScanResult } from '@/types/scanner'

export type DrawerItem =
  | { type: 'prospect'; data: Prospect }
  | { type: 'scan_result'; data: ScanResult }

interface DrawerContextValue {
  item: DrawerItem | null
  openDrawer: (item: DrawerItem) => void
  closeDrawer: () => void
  updateDrawerItem: (item: DrawerItem) => void
}

const DrawerContext = createContext<DrawerContextValue | null>(null)

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [item, setItem] = useState<DrawerItem | null>(null)

  const openDrawer = useCallback((newItem: DrawerItem) => setItem(newItem), [])
  const closeDrawer = useCallback(() => setItem(null), [])
  const updateDrawerItem = useCallback((newItem: DrawerItem) => setItem(newItem), [])

  return (
    <DrawerContext.Provider value={{ item, openDrawer, closeDrawer, updateDrawerItem }}>
      {children}
    </DrawerContext.Provider>
  )
}

export function useDrawer() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('useDrawer must be used within DrawerProvider')
  return ctx
}
