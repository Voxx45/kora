# Prospect Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a universal right-side drawer that shows a detailed company/prospect fiche with inline editing when clicking any prospect or scan result anywhere in the admin.

**Architecture:** A React Context (`DrawerContext`) installed in the admin layout exposes `openDrawer(item)` / `closeDrawer()`. The single `ProspectDrawer` component renders fixed to the right edge. Any child component calls `useDrawer().openDrawer(...)` — no prop drilling. Supports two modes: `prospect` (CRM) with inline pipeline/notes editing, and `scan_result` (Scanner) with web signals and promote button.

**Tech Stack:** Next.js 16 App Router, React Context, Supabase server actions, `@dnd-kit` (unchanged), inline styles (dark theme)

---

## File Structure

```
lib/contexts/
  drawer-context.tsx           — CREATE: DrawerItem union type, DrawerProvider, useDrawer()
components/admin/
  ProspectDrawer.tsx           — CREATE: 360px fixed right drawer, both modes
  DashboardProspects.tsx       — CREATE: client wrapper for dashboard prospect table
lib/actions/
  prospects.ts                 — MODIFY: add updateProspectNotes(id, notes)
app/(admin)/
  layout.tsx                   — MODIFY: wrap in DrawerProvider + <ProspectDrawer />
components/admin/
  DataTable.tsx                — MODIFY: add optional onRowClick prop
  ProspectCard.tsx             — MODIFY: company name opens drawer instead of Link
  ScannerResults.tsx           — MODIFY: company name cell opens drawer
app/(admin)/prospects/
  ProspectsClient.tsx          — MODIFY: company name opens drawer instead of Link
app/(admin)/dashboard/
  page.tsx                     — MODIFY: use DashboardProspects client component
```

---

### Task 1: `updateProspectNotes` Server Action

**Files:**
- Modify: `lib/actions/prospects.ts`

- [ ] **Step 1: Add the action**

Open `lib/actions/prospects.ts` and append this function at the end of the file (after `deleteProspect`):

```typescript
export async function updateProspectNotes(id: string, notes: string): Promise<void> {
  if (!id) throw new Error('Invalid id')
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('prospects')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/actions/prospects.ts
git commit -m "feat(drawer): add updateProspectNotes server action"
```

---

### Task 2: DrawerContext

**Files:**
- Create: `lib/contexts/drawer-context.tsx`

- [ ] **Step 1: Create the context file**

```typescript
// lib/contexts/drawer-context.tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/contexts/drawer-context.tsx
git commit -m "feat(drawer): DrawerContext + DrawerProvider + useDrawer"
```

---

### Task 3: ProspectDrawer Component

**Files:**
- Create: `components/admin/ProspectDrawer.tsx`

This is the largest component. Read the existing `components/admin/ProspectForm.tsx` before writing — it shows the exact modal pattern to reuse for inline editing.

- [ ] **Step 1: Create the component**

```typescript
// components/admin/ProspectDrawer.tsx
'use client'
import { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDrawer } from '@/lib/contexts/drawer-context'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { ProspectForm } from '@/components/admin/ProspectForm'
import { updateProspectStage, updateProspectNotes, deleteProspect } from '@/lib/actions/prospects'
import { promoteToCRM } from '@/lib/actions/scanner'
import type { PipelineStage } from '@/types/crm'

const STAGES: { value: PipelineStage; label: string }[] = [
  { value: 'nouveau',      label: 'Nouveau' },
  { value: 'contacte',     label: 'Contacté' },
  { value: 'devis_envoye', label: 'Devis' },
  { value: 'negocia',      label: 'Négo.' },
  { value: 'gagne',        label: 'Gagné' },
  { value: 'perdu',        label: 'Perdu' },
]

const SOURCE_LABEL: Record<string, string> = {
  contact_form: 'Formulaire',
  manual: 'Manuel',
  scanner: 'Scanner',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, width: 70, flexShrink: 0, paddingTop: 1 }}>
        {label}
      </span>
      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, wordBreak: 'break-word' }}>
        {children}
      </span>
    </div>
  )
}

export function ProspectDrawer() {
  const { item, closeDrawer, updateDrawerItem } = useDrawer()
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [currentStage, setCurrentStage] = useState<PipelineStage>('nouveau')
  const [promoted, setPromoted] = useState(false)
  const [, startTransition] = useTransition()
  const drawerRef = useRef<HTMLDivElement>(null)

  const isOpen = item !== null

  // Sync local state when drawer item changes
  useEffect(() => {
    if (!item) return
    setEditOpen(false)
    setNotesSaved(false)
    if (item.type === 'prospect') {
      setNotes(item.data.notes ?? '')
      setCurrentStage(item.data.pipeline_stage)
    }
    if (item.type === 'scan_result') {
      setPromoted(item.data.promoted)
    }
  }, [item])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !editOpen) closeDrawer()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [closeDrawer, editOpen])

  function handleStageClick(stage: PipelineStage) {
    if (!item || item.type !== 'prospect') return
    const prev = currentStage
    setCurrentStage(stage)
    startTransition(async () => {
      try {
        await updateProspectStage(item.data.id, stage)
        router.refresh()
      } catch {
        setCurrentStage(prev)
      }
    })
  }

  async function handleSaveNotes() {
    if (!item || item.type !== 'prospect') return
    setNotesSaving(true)
    try {
      await updateProspectNotes(item.data.id, notes)
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
      router.refresh()
    } catch {
      // ignore
    }
    setNotesSaving(false)
  }

  async function handleDelete() {
    if (!item || item.type !== 'prospect') return
    if (!confirm(`Supprimer "${item.data.entreprise ?? item.data.prenom}" ?`)) return
    await deleteProspect(item.data.id)
    closeDrawer()
    router.refresh()
  }

  async function handlePromote() {
    if (!item || item.type !== 'scan_result') return
    setPromoted(true)
    try {
      await promoteToCRM(item.data.id)
    } catch {
      setPromoted(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={closeDrawer}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.4)',
            transition: 'opacity 200ms ease',
          }}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 360,
          zIndex: 41,
          background: '#12141E',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 200ms ease-out',
          overflowY: 'auto',
        }}
      >
        {item?.type === 'prospect' && (
          <>
            {/* Header */}
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 2, wordBreak: 'break-word' }}>
                    {item.data.entreprise ?? item.data.prenom}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>
                    {item.data.prenom} · {SOURCE_LABEL[item.data.source] ?? item.data.source}
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, marginLeft: 8 }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
                <ScoreBadge score={item.data.score} />
              </div>
            </div>

            {/* Pipeline stage */}
            <Section title="Étape pipeline">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {STAGES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => handleStageClick(s.value)}
                    style={{
                      padding: '4px 9px',
                      borderRadius: 5,
                      fontSize: 10,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: currentStage === s.value ? '#007AFF' : 'rgba(255,255,255,0.07)',
                      color: currentStage === s.value ? '#fff' : 'rgba(255,255,255,0.45)',
                      transition: 'background 150ms',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Contact */}
            <Section title="Contact">
              <a href={`mailto:${item.data.email}`} style={{ color: '#007AFF', fontSize: 10, display: 'block', marginBottom: 5 }}>
                {item.data.email}
              </a>
              {item.data.telephone && (
                <InfoRow label="Téléphone">
                  <a href={`tel:${item.data.telephone}`} style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
                    {item.data.telephone}
                  </a>
                </InfoRow>
              )}
              {item.data.service_interesse && (
                <InfoRow label="Service">{item.data.service_interesse}</InfoRow>
              )}
              {item.data.valeur_estimee != null && (
                <InfoRow label="Valeur">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(item.data.valeur_estimee)}
                </InfoRow>
              )}
              {item.data.next_followup_at && (
                <InfoRow label="Relance">
                  {new Date(item.data.next_followup_at).toLocaleDateString('fr-FR')}
                </InfoRow>
              )}
            </Section>

            {/* Notes */}
            <Section title="Notes internes">
              <textarea
                value={notes}
                onChange={e => { setNotes(e.target.value); setNotesSaved(false) }}
                placeholder="Ajouter une note…"
                rows={4}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 7,
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 11,
                  padding: '7px 9px',
                  resize: 'vertical',
                  fontFamily: 'system-ui',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSaveNotes}
                disabled={notesSaving}
                style={{
                  marginTop: 5,
                  background: notesSaved ? '#34C759' : '#007AFF',
                  color: '#fff',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {notesSaved ? '✓ Enregistré' : notesSaving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </Section>

            {/* Message initial */}
            {item.data.message && (
              <Section title="Message initial">
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, lineHeight: 1.5, margin: 0 }}>
                  {item.data.message}
                </p>
              </Section>
            )}

            {/* Footer */}
            <div style={{ padding: '12px 16px', marginTop: 'auto', display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => setEditOpen(true)}
                style={{
                  flex: 1,
                  background: '#007AFF',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 0',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✏ Modifier
              </button>
              <a
                href={`/admin/prospects/${item.data.id}`}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.6)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                Fiche →
              </a>
              <button
                onClick={handleDelete}
                style={{
                  background: 'rgba(255,59,48,0.12)',
                  color: '#FF3B30',
                  border: 'none',
                  padding: '8px 10px',
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                🗑
              </button>
            </div>
          </>
        )}

        {item?.type === 'scan_result' && (
          <>
            {/* Header */}
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                    {item.data.name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>
                    {item.data.city} · {item.data.place_type.replace(/_/g, ' ')}
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, marginLeft: 8 }}
                >
                  ✕
                </button>
              </div>
              <div style={{ marginTop: 10 }}>
                <ScoreBadge score={item.data.score} />
              </div>
            </div>

            {/* Contact */}
            <Section title="Contact">
              {item.data.phone && (
                <InfoRow label="Téléphone">
                  <a href={`tel:${item.data.phone}`} style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
                    {item.data.phone}
                  </a>
                </InfoRow>
              )}
              {item.data.address && <InfoRow label="Adresse">{item.data.address}</InfoRow>}
              {item.data.website ? (
                <InfoRow label="Site">
                  <a href={item.data.website} target="_blank" rel="noopener noreferrer" style={{ color: '#007AFF' }}>
                    {new URL(item.data.website).hostname} ↗
                  </a>
                </InfoRow>
              ) : (
                <InfoRow label="Site">
                  <span style={{ color: 'rgba(255,59,48,0.8)' }}>Aucun site</span>
                </InfoRow>
              )}
            </Section>

            {/* Signaux web */}
            <Section title="Signaux web">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  {
                    label: 'HTTPS',
                    value: item.data.has_https ? '✓ Sécurisé' : '✗ HTTP',
                    color: item.data.has_https ? '#34C759' : '#FF3B30',
                  },
                  {
                    label: 'Note GMB',
                    value: item.data.gmb_rating != null
                      ? `★ ${item.data.gmb_rating} (${item.data.gmb_reviews ?? 0})`
                      : '—',
                    color: 'rgba(255,255,255,0.75)',
                  },
                ].map(sig => (
                  <div key={sig.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '7px 9px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, marginBottom: 3 }}>{sig.label}</div>
                    <div style={{ color: sig.color, fontSize: 11, fontWeight: 600 }}>{sig.value}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Analyse IA */}
            {item.data.notes && (
              <Section title="Analyse IA">
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                  {item.data.notes}
                </p>
              </Section>
            )}

            {/* Footer */}
            <div style={{ padding: '12px 16px', marginTop: 'auto', flexShrink: 0 }}>
              {promoted || item.data.promoted ? (
                <div style={{
                  width: '100%', background: 'rgba(52,199,89,0.1)', color: '#34C759',
                  padding: '10px 0', borderRadius: 8, fontSize: 11, fontWeight: 700, textAlign: 'center',
                }}>
                  ✓ Dans le CRM
                </div>
              ) : (
                <button
                  onClick={handlePromote}
                  style={{
                    width: '100%', background: '#34C759', color: '#fff', border: 'none',
                    padding: '10px 0', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  ＋ Ajouter au CRM
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ProspectForm on top of drawer */}
      {editOpen && item?.type === 'prospect' && (
        <ProspectForm
          prospect={item.data}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false)
            closeDrawer()
            router.refresh()
          }}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/ProspectDrawer.tsx
git commit -m "feat(drawer): ProspectDrawer component — prospect + scan_result modes"
```

---

### Task 4: Wire DrawerProvider into Admin Layout

**Files:**
- Modify: `app/(admin)/layout.tsx`

The current layout:

```typescript
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: '#0C0E16' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 1: Replace with wired layout**

```typescript
// app/(admin)/layout.tsx
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { DrawerProvider } from '@/lib/contexts/drawer-context'
import { ProspectDrawer } from '@/components/admin/ProspectDrawer'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DrawerProvider>
      <div className="min-h-screen flex" style={{ background: '#0C0E16' }}>
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
      <ProspectDrawer />
    </DrawerProvider>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(admin\)/layout.tsx
git commit -m "feat(drawer): wire DrawerProvider + ProspectDrawer into admin layout"
```

---

### Task 5: Add `onRowClick` to DataTable

**Files:**
- Modify: `components/admin/DataTable.tsx`

The current `DataTableProps` interface and row rendering need an optional `onRowClick` callback.

- [ ] **Step 1: Update the component**

Replace the full file content:

```typescript
// components/admin/DataTable.tsx
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  key: keyof T | string
  label: string
  width?: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  keyExtractor: (row: T) => string
  emptyMessage?: string
  className?: string
  onRowClick?: (row: T) => void
}

export function DataTable<T extends object>({
  columns,
  rows,
  keyExtractor,
  emptyMessage = 'Aucune donnée',
  className,
  onRowClick,
}: DataTableProps<T>) {
  const gridTemplate = columns.map(c => c.width ?? '1fr').join(' ')

  return (
    <div
      className={cn('rounded-[14px] overflow-hidden', className)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* En-têtes */}
      <div
        className="grid px-3.5 py-2"
        style={{
          gridTemplateColumns: gridTemplate,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {columns.map(col => (
          <div
            key={String(col.key)}
            className="text-[8px] uppercase tracking-[1.5px]"
            style={{ color: 'rgba(255,255,255,0.22)' }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Lignes */}
      {rows.length === 0 ? (
        <div className="px-3.5 py-4 text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
          {emptyMessage}
        </div>
      ) : (
        rows.map((row, i) => (
          <div
            key={keyExtractor(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className="grid px-3.5 py-2.5 items-center"
            style={{
              gridTemplateColumns: gridTemplate,
              borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              cursor: onRowClick ? 'pointer' : 'default',
              transition: 'background 100ms',
            }}
            onMouseEnter={onRowClick ? e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' } : undefined}
            onMouseLeave={onRowClick ? e => { (e.currentTarget as HTMLDivElement).style.background = '' } : undefined}
          >
            {columns.map(col => (
              <div key={String(col.key)} className="text-[10.5px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {col.render
                  ? col.render(row)
                  : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/DataTable.tsx
git commit -m "feat(drawer): add onRowClick prop to DataTable"
```

---

### Task 6: Wire ProspectCard (Kanban)

**Files:**
- Modify: `components/admin/ProspectCard.tsx`

The company name is currently a `Link` that navigates away. Replace with a button that opens the drawer. Use `onPointerDown={e => e.stopPropagation()}` to prevent the dnd-kit drag from triggering on click.

- [ ] **Step 1: Replace the component**

```typescript
// components/admin/ProspectCard.tsx
'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ScoreBadge } from './ScoreBadge'
import { useDrawer } from '@/lib/contexts/drawer-context'
import type { Prospect } from '@/types/crm'

export function ProspectCard({ prospect }: { prospect: Prospect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: prospect.id })
  const { openDrawer } = useDrawer()

  const now = new Date()
  const followup = prospect.next_followup_at ? new Date(prospect.next_followup_at) : null

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      className="rounded-[10px] p-3 flex flex-col gap-1.5 cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between">
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation()
            openDrawer({ type: 'prospect', data: prospect })
          }}
          className="text-[11px] font-semibold hover:underline text-left"
          style={{ color: 'rgba(255,255,255,0.85)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {prospect.entreprise ?? prospect.prenom}
        </button>
        <ScoreBadge score={prospect.score} />
      </div>
      {prospect.service_interesse && (
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{prospect.service_interesse}</p>
      )}
      {prospect.valeur_estimee != null && (
        <p className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {prospect.valeur_estimee} €
        </p>
      )}
      {followup && (
        <p className="text-[9px]" style={{ color: followup < now ? '#FF453A' : 'rgba(255,255,255,0.3)' }}>
          📅 {followup.toLocaleDateString('fr-FR')}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/ProspectCard.tsx
git commit -m "feat(drawer): ProspectCard opens drawer on company name click"
```

---

### Task 7: Wire ProspectsClient (Liste Prospects)

**Files:**
- Modify: `app/(admin)/prospects/ProspectsClient.tsx`

Replace the `Link` on the company name with a button calling `openDrawer`. Also replace the `Link` edit icon with the same button. Remove the `import Link from 'next/link'` if no longer used.

- [ ] **Step 1: Update the component**

The key changes are:
1. Add `useDrawer` import and hook
2. Replace company name `Link` with a `button` calling `openDrawer`
3. Replace the `✏` link with a button calling `openDrawer`
4. Keep the `deleteProspect` button as-is

Replace the full file:

```typescript
// app/(admin)/prospects/ProspectsClient.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProspect } from '@/lib/actions/prospects'
import { ProspectForm } from '@/components/admin/ProspectForm'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { PipelineBadge } from '@/components/admin/StatusBadge'
import { DataTable } from '@/components/admin/DataTable'
import { useDrawer } from '@/lib/contexts/drawer-context'
import type { Prospect, PipelineStage } from '@/types/crm'

const SOURCE_LABEL: Record<string, string> = {
  contact_form: '🌐 Formulaire',
  manual:       '✋ Manuel',
  scanner:      '🤖 Scanner',
}

const FILTERS: { value: PipelineStage | 'all'; label: string }[] = [
  { value: 'all',          label: 'Tous' },
  { value: 'nouveau',      label: 'Nouveau' },
  { value: 'contacte',     label: 'Contacté' },
  { value: 'devis_envoye', label: 'Devis' },
  { value: 'gagne',        label: 'Gagné' },
  { value: 'perdu',        label: 'Perdu' },
]

interface Props { prospects: Prospect[] }

export function ProspectsClient({ prospects }: Props) {
  const router = useRouter()
  const { openDrawer } = useDrawer()
  const [filter, setFilter] = useState<PipelineStage | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [, startTransition] = useTransition()

  const now = new Date()
  const visible = filter === 'all' ? prospects : prospects.filter(p => p.pipeline_stage === filter)
  const sorted = [...visible].sort((a, b) => b.score - a.score)

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!confirm('Supprimer ce prospect ?')) return
    startTransition(async () => {
      await deleteProspect(id)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <span>KORA</span><span>/</span>
          <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>Prospects</span>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="px-3 py-1.5 rounded-[10px] text-[11px] font-semibold"
          style={{ background: 'linear-gradient(135deg,#FCD34D,#F97316)', color: '#000' }}
        >
          ＋ Ajouter un prospect
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {/* Filtres */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-3 py-1 rounded-full text-[10px] font-semibold"
              style={
                filter === f.value
                  ? { background: 'linear-gradient(135deg,#FCD34D,#F97316)', color: '#000' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucun prospect</p>
            <button
              onClick={() => setFormOpen(true)}
              className="px-4 py-2 rounded-[10px] text-[11px] font-semibold"
              style={{ background: 'linear-gradient(135deg,#FCD34D,#F97316)', color: '#000' }}
            >
              ＋ Ajouter un prospect
            </button>
          </div>
        ) : (
          <DataTable<Prospect>
            columns={[
              {
                key: 'entreprise',
                label: 'Entreprise',
                width: '2fr',
                render: (r: Prospect) => (
                  <button
                    onClick={e => { e.stopPropagation(); openDrawer({ type: 'prospect', data: r }) }}
                    className="hover:underline text-left"
                    style={{ color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
                  >
                    {r.entreprise ?? r.prenom}
                  </button>
                ),
              },
              { key: 'source', label: 'Source', render: (r: Prospect) => SOURCE_LABEL[r.source] ?? r.source },
              { key: 'score', label: 'Score', render: (r: Prospect) => <ScoreBadge score={r.score} /> },
              { key: 'service', label: 'Service', render: (r: Prospect) => r.service_interesse ?? '—' },
              { key: 'pipeline_stage', label: 'Étape', render: (r: Prospect) => <PipelineBadge stage={r.pipeline_stage} /> },
              {
                key: 'next_followup_at',
                label: 'Relance',
                render: (r: Prospect) => {
                  if (!r.next_followup_at) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                  const d = new Date(r.next_followup_at)
                  return <span style={{ color: d < now ? '#FF453A' : 'rgba(255,255,255,0.6)' }}>{d.toLocaleDateString('fr-FR')}</span>
                },
              },
              {
                key: 'actions',
                label: '',
                width: '60px',
                render: (r: Prospect) => (
                  <button
                    onClick={e => handleDelete(e, r.id)}
                    className="text-[11px]"
                    style={{ color: 'rgba(255,69,58,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                ),
              },
            ]}
            rows={sorted}
            keyExtractor={(r: Prospect) => r.id}
            onRowClick={(r: Prospect) => openDrawer({ type: 'prospect', data: r })}
          />
        )}
      </div>

      {formOpen && (
        <ProspectForm
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); router.refresh() }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(admin\)/prospects/ProspectsClient.tsx
git commit -m "feat(drawer): prospects list opens drawer on row/name click"
```

---

### Task 8: Dashboard — DashboardProspects Client Component

**Files:**
- Create: `components/admin/DashboardProspects.tsx`
- Modify: `app/(admin)/dashboard/page.tsx`

The dashboard `page.tsx` is a server component that renders a `DataTable` with prospect rows. Since `useDrawer()` is a client hook, extract the prospect table into a client component.

- [ ] **Step 1: Create `DashboardProspects.tsx`**

```typescript
// components/admin/DashboardProspects.tsx
'use client'
import { DataTable } from '@/components/admin/DataTable'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { PipelineBadge } from '@/components/admin/StatusBadge'
import { useDrawer } from '@/lib/contexts/drawer-context'
import type { Prospect } from '@/types/crm'

export function DashboardProspects({ prospects }: { prospects: Prospect[] }) {
  const { openDrawer } = useDrawer()
  const now = new Date()

  return (
    <DataTable<Prospect>
      columns={[
        {
          key: 'entreprise',
          label: 'Entreprise',
          render: (r: Prospect) => r.entreprise ?? r.prenom,
        },
        {
          key: 'score',
          label: 'Score',
          render: (r: Prospect) => <ScoreBadge score={r.score} />,
        },
        {
          key: 'pipeline_stage',
          label: 'Statut',
          render: (r: Prospect) => <PipelineBadge stage={r.pipeline_stage} />,
        },
        {
          key: 'next_followup_at',
          label: 'Relance',
          render: (r: Prospect) => {
            if (!r.next_followup_at) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
            const d = new Date(r.next_followup_at)
            return (
              <span style={{ color: d < now ? '#FF453A' : 'rgba(255,255,255,0.6)' }}>
                {d.toLocaleDateString('fr-FR')}
              </span>
            )
          },
        },
      ]}
      rows={prospects}
      keyExtractor={(r: Prospect) => r.id}
      emptyMessage="Aucun prospect pour l'instant"
      onRowClick={(r: Prospect) => openDrawer({ type: 'prospect', data: r })}
    />
  )
}
```

- [ ] **Step 2: Update `app/(admin)/dashboard/page.tsx`**

Replace the `DataTable` import and usage with `DashboardProspects`. The server component passes the full `Prospect` objects (not just the selected fields) so the drawer has all data.

```typescript
// app/(admin)/dashboard/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { KpiCard } from '@/components/admin/KpiCard'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { DashboardProspects } from '@/components/admin/DashboardProspects'
import type { Prospect } from '@/types/crm'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  const [
    { count: hotLeads },
    { count: activeProjects },
    { count: followups },
    { data: pipelineRows },
    { data: recentProspects },
  ] = await Promise.all([
    supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .gte('score', 80)
      .not('pipeline_stage', 'in', '("gagne","perdu")'),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'en_cours'),
    supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .not('next_followup_at', 'is', null)
      .lte('next_followup_at', new Date(Date.now() + 86_400_000).toISOString())
      .not('pipeline_stage', 'in', '("gagne","perdu")'),
    supabase
      .from('prospects')
      .select('valeur_estimee')
      .not('pipeline_stage', 'in', '("gagne","perdu")'),
    supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const pipeline = (pipelineRows ?? []).reduce(
    (sum: number, r: { valeur_estimee: number | null }) => sum + (r.valeur_estimee ?? 0),
    0
  )

  const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="Leads chauds" value={String(hotLeads ?? 0)} />
          <KpiCard label="Projets actifs" value={String(activeProjects ?? 0)} />
          <KpiCard label="Relances (24h)" value={String(followups ?? 0)} />
          <KpiCard label="Pipeline estimé" value={fmt.format(pipeline)} />
        </div>

        {/* Table derniers prospects */}
        <div>
          <div className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Derniers prospects
          </div>
          <DashboardProspects prospects={(recentProspects ?? []) as Prospect[]} />
        </div>

      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/admin/DashboardProspects.tsx app/\(admin\)/dashboard/page.tsx
git commit -m "feat(drawer): dashboard prospect table opens drawer on row click"
```

---

### Task 9: Wire ScannerResults

**Files:**
- Modify: `components/admin/ScannerResults.tsx`

Add `useDrawer` and make the company name cell clickable. Keep the "+ CRM" button as-is.

- [ ] **Step 1: Update the component**

```typescript
// components/admin/ScannerResults.tsx
'use client'
import { useState, useEffect, useTransition } from 'react'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { promoteToCRM } from '@/lib/actions/scanner'
import { useDrawer } from '@/lib/contexts/drawer-context'
import type { ScanResult } from '@/types/scanner'

interface ScannerResultsProps {
  initialResults: ScanResult[]
  refreshKey: number
}

export function ScannerResults({ initialResults, refreshKey }: ScannerResultsProps) {
  const [results, setResults] = useState<ScanResult[]>(initialResults)
  const [isPending, startTransition] = useTransition()
  const { openDrawer } = useDrawer()

  async function refresh() {
    const res = await fetch('/api/scanner/results')
    if (res.ok) {
      const data: ScanResult[] = await res.json()
      setResults(data)
    }
  }

  useEffect(() => {
    if (refreshKey > 0) refresh()
  }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePromote(result: ScanResult) {
    setResults(prev =>
      prev.map(r => r.id === result.id ? { ...r, promoted: true } : r)
    )
    startTransition(async () => {
      try {
        await promoteToCRM(result.id)
      } catch {
        setResults(prev =>
          prev.map(r => r.id === result.id ? { ...r, promoted: false } : r)
        )
      }
    })
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Entreprise', 'Ville', 'Secteur', 'Site', 'Score', ''].map(h => (
              <th
                key={h}
                className="text-left px-4 py-2"
                style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                Aucun résultat — lance un scan pour commencer.
              </td>
            </tr>
          )}
          {results.map(result => (
            <tr
              key={result.id}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              className="hover:bg-white/[0.02]"
            >
              <td className="px-4 py-2.5">
                <button
                  onClick={() => openDrawer({ type: 'scan_result', data: result })}
                  className="hover:underline text-left"
                  style={{ color: '#fff', fontWeight: 500, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {result.name}
                </button>
              </td>
              <td className="px-4 py-2.5" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                {result.city}
              </td>
              <td className="px-4 py-2.5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                {result.place_type.replace(/_/g, ' ')}
              </td>
              <td className="px-4 py-2.5">
                {result.website ? (
                  <a
                    href={result.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ color: '#007AFF', fontSize: 11 }}
                    className="hover:underline"
                  >
                    {new URL(result.website).hostname}
                  </a>
                ) : (
                  <span style={{ color: 'rgba(255,59,48,0.8)', fontSize: 11 }}>Aucun site</span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <ScoreBadge score={result.score} />
              </td>
              <td className="px-4 py-2.5">
                {result.promoted ? (
                  <span style={{ color: '#34C759', fontSize: 11, fontWeight: 600 }}>✓ CRM</span>
                ) : (
                  <button
                    onClick={() => handlePromote(result)}
                    disabled={isPending}
                    style={{
                      background: '#007AFF', color: '#fff', border: 'none',
                      padding: '3px 10px', borderRadius: 5, fontSize: 11,
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    + CRM
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests pass (no regressions — drawer is UI only, no logic changes in tested files).

- [ ] **Step 4: Commit**

```bash
git add components/admin/ScannerResults.tsx
git commit -m "feat(drawer): scanner results open drawer on company name click"
```

---

### Task 10: Final Verification

**Files:** none new

- [ ] **Step 1: TypeScript clean**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Tests pass**

```bash
npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 3: Manual smoke test**

Start the dev server if not running:

```bash
npm run dev
```

Navigate to `http://localhost:3000/admin/dashboard` and verify:

- [ ] Click any row in "Derniers prospects" → drawer slides in from right with prospect data
- [ ] Click a pipeline stage button → stage updates immediately (optimistic)
- [ ] Edit notes + click Enregistrer → button turns green "✓ Enregistré"
- [ ] Click "✏ Modifier" → ProspectForm modal opens on top of drawer
- [ ] Save form → drawer closes, page refreshes
- [ ] Press Escape → drawer closes
- [ ] Click overlay → drawer closes

Navigate to `http://localhost:3000/admin/pipeline`:
- [ ] Click company name on a kanban card → drawer opens (drag still works)
- [ ] Drag a card to another column → no drawer opens (drag handled separately)

Navigate to `http://localhost:3000/admin/prospects`:
- [ ] Click any row → drawer opens
- [ ] Click company name specifically → drawer opens

Navigate to `http://localhost:3000/admin/scanner`:
- [ ] Click company name → drawer opens with scan_result mode
- [ ] Verify web signals section (HTTPS, GMB rating) displays
- [ ] Click "＋ Ajouter au CRM" → button changes to "✓ Dans le CRM"
- [ ] "+ CRM" button in table still works independently

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(drawer): SP5 Prospect Drawer — universal company fiche overlay"
```
