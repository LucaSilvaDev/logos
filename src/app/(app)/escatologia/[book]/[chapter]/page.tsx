"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"

const FIELDS = [
  { key: "historicalFulfillment", label: "Cumprimento Histórico",
    placeholder: "Como este texto foi cumprido historicamente? Ex: Destruição de Jerusalém em 70 d.C." },
  { key: "futureProphecy",        label: "Profecia Futura",
    placeholder: "Que eventos futuros este texto anuncia? (Posição Pós-Trib / Pré-Mil Histórico)" },
  { key: "tribulationNote",       label: "Tribulação",
    placeholder: "Como este texto se relaciona com a Grande Tribulação?" },
  { key: "christReturnNote",      label: "Segunda Vinda",
    placeholder: "Como este texto aponta para o retorno de Cristo?" },
  { key: "generalNotes",          label: "Notas Gerais",
    placeholder: "Observações exegéticas, vocabulário, contexto, links com outros textos..." },
] as const

type FieldKey = typeof FIELDS[number]["key"]
type Notes = Record<FieldKey, string>

const EMPTY: Notes = { historicalFulfillment: "", futureProphecy: "", tribulationNote: "", christReturnNote: "", generalNotes: "" }

export default function EschatologyChapterPage() {
  const router = useRouter()
  const params = useParams()
  const book = decodeURIComponent(params.book as string)
  const chapter = parseInt(params.chapter as string)

  const [title, setTitle] = useState(`${book} ${chapter} — Estudo Escatológico`)
  const [notes, setNotes] = useState<Notes>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/escatologia/${encodeURIComponent(book)}/${chapter}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        setTitle(d.title || `${book} ${chapter} — Estudo Escatológico`)
        setNotes({
          historicalFulfillment: d.historicalFulfillment || "",
          futureProphecy:        d.futureProphecy || "",
          tribulationNote:       d.tribulationNote || "",
          christReturnNote:      d.christReturnNote || "",
          generalNotes:          d.generalNotes || "",
        })
      })
  }, [book, chapter])

  function set(key: FieldKey) {
    return (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setNotes(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function save() {
    setSaving(true)
    try {
      await fetch(`/api/escatologia/${encodeURIComponent(book)}/${chapter}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, ...notes }),
      })
      router.push("/escatologia")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-2 py-8 space-y-6 animate-fade-in">

      <div className="flex items-center justify-between">
        <button onClick={() => router.push("/escatologia")}
          className="flex items-center gap-1.5 text-[#55524a] hover:text-[#8a8375] text-sm transition-colors font-serif">
          <ArrowLeft className="w-4 h-4" /> Escatologia
        </button>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gold text-sm disabled:opacity-40">
          <Save className="w-3.5 h-3.5" /> {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div>
        <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em] mb-1">Profecia Bíblica</p>
        <h1 className="font-serif text-2xl text-[#e2d9c5] font-normal">{book} — Capítulo {chapter}</h1>
      </div>

      <input value={title} onChange={e => setTitle(e.target.value)}
        className="w-full bg-transparent font-serif text-[#8a8375] text-sm border-b border-[#3a2b1c] pb-2 outline-none focus:border-[#c9a654] transition-colors"
        placeholder="Título do estudo" />

      <div className="h-px bg-[#3a2b1c]" />

      <div className="space-y-4">
        {FIELDS.map(f => (
          <div key={f.key} className="card-soft px-5 py-4">
            <label className="font-display text-[9px] text-[#4a3826] uppercase tracking-[0.2em] mb-3 block">
              {f.label}
            </label>
            <textarea value={notes[f.key]} onChange={set(f.key)}
              placeholder={f.placeholder} rows={4}
              className="w-full bg-transparent font-serif text-[#8a8375] text-sm leading-relaxed placeholder:text-[#3a2b1c] outline-none resize-none" />
          </div>
        ))}
      </div>
    </div>
  )
}
