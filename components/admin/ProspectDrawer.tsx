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
  const { item, closeDrawer } = useDrawer()
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

            {item.data.message && (
              <Section title="Message initial">
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, lineHeight: 1.5, margin: 0 }}>
                  {item.data.message}
                </p>
              </Section>
            )}

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
