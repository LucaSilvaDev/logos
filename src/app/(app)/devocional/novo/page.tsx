"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Highlight from "@tiptap/extension-highlight"
import Link from "@tiptap/extension-link"
import Typography from "@tiptap/extension-typography"
import { Save, ArrowLeft, BookOpen, Tag } from "lucide-react"
import { EditorToolbar } from "@/components/EditorToolbar"

export default function NovoDevocionaPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [bibleRef, setBibleRef] = useState("")
  const [tags, setTags] = useState("")
  const [saving, setSaving] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Escreva sua meditação..." }),
      Highlight.configure({ multicolor: false }),
      Link.configure({ openOnClick: false }),
      Typography,
    ],
    editorProps: {
      attributes: { class: "tiptap min-h-[320px] focus:outline-none" },
    },
  })

  async function save() {
    if (!title.trim() || !editor) return
    setSaving(true)
    try {
      const res = await fetch("/api/devocional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: editor.getHTML(),
          bibleRef: bibleRef.trim() || null,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean).join(","),
          mood: null,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/devocional/${data.id}`)
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
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gold text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <Save className="w-3.5 h-3.5" />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Título do devocional..."
        className="w-full bg-transparent font-serif text-[#e2d9c5] text-2xl placeholder:text-[#3d3a55] outline-none border-b border-[#2e2b42] pb-3 focus:border-[#c9a654] transition-colors"
      />

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <BookOpen className="w-3.5 h-3.5 text-[#3d3a55] flex-shrink-0" />
          <input value={bibleRef} onChange={e => setBibleRef(e.target.value)}
            placeholder="Referência bíblica (ex: Sl 23:1)"
            className="app-input flex-1 px-3 py-1.5 text-sm" />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <Tag className="w-3.5 h-3.5 text-[#3d3a55] flex-shrink-0" />
          <input value={tags} onChange={e => setTags(e.target.value)}
            placeholder="Tags (separadas por vírgula)"
            className="app-input flex-1 px-3 py-1.5 text-sm" />
        </div>
      </div>

      <div className="card-soft overflow-hidden">
        <EditorToolbar editor={editor} />
        <div className="px-6 py-5">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
