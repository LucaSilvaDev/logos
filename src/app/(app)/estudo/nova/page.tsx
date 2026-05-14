"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Highlight from "@tiptap/extension-highlight"
import Typography from "@tiptap/extension-typography"
import { Save, ArrowLeft } from "lucide-react"
import { EditorToolbar } from "@/components/EditorToolbar"
import { ALL_BOOK_NAMES } from "@/lib/reading-plan"
import { cn } from "@/lib/utils"

const NOTE_TYPES = [
  { id: "exegesis",     label: "Exegese" },
  { id: "theology",     label: "Teologia" },
  { id: "application",  label: "Aplicação" },
  { id: "word_study",   label: "Palavra" },
  { id: "cross_ref",    label: "Ref. Cruzada" },
]

export default function NovaNotaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultBook    = searchParams.get("book")    ?? "Romanos"
  const defaultChapter = searchParams.get("chapter") ?? ""
  const defaultVerse   = searchParams.get("verse")   ?? ""

  const [title, setTitle] = useState("")
  const [book, setBook] = useState(defaultBook)
  const [chapter, setChapter] = useState(defaultChapter)
  const [verse, setVerse] = useState(defaultVerse)
  const [type, setType] = useState("exegesis")
  const [tags, setTags] = useState("")
  const [saving, setSaving] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Escreva sua análise exegética, teológica ou aplicação..." }),
      Highlight.configure({ multicolor: false }),
      Typography,
    ],
    editorProps: { attributes: { class: "tiptap min-h-[300px] focus:outline-none" } },
  })

  async function save() {
    if (!title.trim() || !editor) return
    setSaving(true)
    try {
      const res = await fetch("/api/estudo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, content: editor.getHTML(), book,
          chapter: chapter ? parseInt(chapter) : null,
          verse: verse ? parseInt(verse) : null,
          type, tags,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/estudo/${data.id}`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-2 py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#55524a] hover:text-[#8a8375] text-sm transition-colors font-serif">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <button onClick={save} disabled={!title.trim() || saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gold text-sm disabled:opacity-40">
          <Save className="w-3.5 h-3.5" /> {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Título da nota..."
        className="w-full bg-transparent font-serif text-[#e2d9c5] text-2xl placeholder:text-[#4a3826] outline-none border-b border-[#3a2b1c] pb-3 focus:border-[#c9a654] transition-colors" />

      <div className="flex flex-wrap gap-2">
        <select value={book} onChange={e => setBook(e.target.value)}
          className="app-input px-3 py-1.5 text-sm">
          {ALL_BOOK_NAMES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <input value={chapter} onChange={e => setChapter(e.target.value)} placeholder="Cap."
          className="app-input w-16 px-3 py-1.5 text-sm" />
        <input value={verse} onChange={e => setVerse(e.target.value)} placeholder="v."
          className="app-input w-16 px-3 py-1.5 text-sm" />
        <select value={type} onChange={e => setType(e.target.value)}
          className="app-input px-3 py-1.5 text-sm">
          {NOTE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags"
          className="app-input flex-1 min-w-[120px] px-3 py-1.5 text-sm" />
      </div>

      <div className="card-soft overflow-hidden">
        <EditorToolbar editor={editor} />
        <div className="px-6 py-5 min-h-[320px]">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
