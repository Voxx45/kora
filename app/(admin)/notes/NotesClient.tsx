'use client'
import { useState, useEffect, useRef, useTransition } from 'react'
import { saveGlobalNote } from '@/lib/actions/notes'

export function NotesClient({ initialContent }: { initialContent: string }) {
  const [content, setContent] = useState(initialContent)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [, start] = useTransition()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initial = useRef(initialContent)

  useEffect(() => {
    if (content === initial.current) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      start(async () => {
        await saveGlobalNote(content)
        setSavedAt(new Date())
      })
    }, 2000)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [content])

  const relativeTime = savedAt
    ? `Sauvegardé il y a ${Math.round((Date.now() - savedAt.getTime()) / 1000)} s`
    : null

  return (
    <div className="flex-1 flex flex-col p-5 gap-2 overflow-hidden">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Notes libres, scripts d'appel, templates…"
        className="flex-1 resize-none rounded-[14px] p-4 text-[12px] leading-relaxed outline-none font-mono"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.75)',
        }}
      />
      {relativeTime && (
        <p className="text-right text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {relativeTime}
        </p>
      )}
    </div>
  )
}
