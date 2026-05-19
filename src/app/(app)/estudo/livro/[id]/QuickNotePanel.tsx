"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, X, Loader2, PenLine } from "lucide-react"

export function QuickNotePanel({ bookName }: { bookName: string }) {
  const router  = useRouter()
  const [open,    setOpen]    = useState(false)
  const [chapter, setChapter] = useState("")
  const [content, setContent] = useState("")
  const [saving,  setSaving]  = useState(false)

  async function save() {
    if (!content.trim()) return
    setSaving(true)
    const chap  = parseInt(chapter) || null
    const title = chap ? `${bookName} ${chap}` : bookName
    try {
      await fetch("/api/estudo", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: content.trim(), book: bookName, chapter: chap, type: "application" }),
      })
      setContent("")
      setChapter("")
      setOpen(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-[#c9a654] hover:opacity-80 transition-opacity font-serif"
      >
        <PenLine className="w-3.5 h-3.5" /> Nota rápida
      </button>
    )
  }

  return (
    <div className="candle-flame card-soft px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[#8a8375] text-[11px] font-display uppercase tracking-wider">
          Nova nota · {bookName}
        </p>
        <button onClick={() => setOpen(false)} className="text-[#3d3a55] hover:text-[#55524a] transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <input
        value={chapter}
        onChange={e => setChapter(e.target.value)}
        type="number"
        min={1}
        placeholder="Capítulo (opcional)"
        className="w-full px-3 py-1.5 text-xs bg-[#12111e] rounded-lg text-[#c9c0a8] placeholder:text-[#3d3a55] border border-[#2e2b42] font-serif outline-none focus:border-[#c9a654] transition-colors"
      />
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Pontos importantes, observações, insights exegéticos..."
        autoFocus
        rows={4}
        className="w-full px-3 py-2 text-sm bg-[#12111e] rounded-lg text-[#c9c0a8] placeholder:text-[#3d3a55] border border-[#2e2b42] font-serif outline-none focus:border-[#c9a654] transition-colors resize-none leading-relaxed"
      />
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-[#3d3a55] hover:text-[#55524a] font-serif transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={save}
          disabled={saving || !content.trim()}
          className="flex items-center gap-1.5 text-xs text-[#c9a654] hover:opacity-80 font-serif disabled:opacity-40 transition-opacity"
        >
          {saving && <Loader2 className="w-3 h-3 animate-spin" />}
          Salvar nota
        </button>
      </div>
    </div>
  )
}
