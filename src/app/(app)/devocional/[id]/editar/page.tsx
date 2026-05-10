"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Highlight from "@tiptap/extension-highlight"
import Link from "@tiptap/extension-link"
import Typography from "@tiptap/extension-typography"
import { Save, ArrowLeft, BookOpen, Tag, Trash2 } from "lucide-react"
import { EditorToolbar } from "@/components/EditorToolbar"

export default function EditarDevocionalPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

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
    editorProps: { attributes: { class: "tiptap min-h-[300px] focus:outline-none" } },
  })

  useEffect(() => {
    fetch(`/api/devocional/${id}`).then(r => r.json()).then(d => {
      setTitle(d.title)
      setBibleRef(d.bibleRef ?? "")
      setTags(d.tags ?? "")
      editor?.commands.setContent(d.content)
    })
  }, [id, editor])

  async function save() {
    if (!title.trim() || !editor) return
    setSaving(true)
    try {
      await fetch(`/api/devocional/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: editor.getHTML(), bibleRef: bibleRef || null, tags }),
      })
      router.push(`/devocional/${id}`)
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!confirm("Excluir este devocional?")) return
    await fetch(`/api/devocional/${id}`, { method: "DELETE" })
    router.push("/devocional")
  }

  return (
    <div className="max-w-2xl mx-auto px-2 py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#55524a] hover:text-[#8a8375] text-sm transition-colors font-serif">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <button onClick={remove}
            className="p-2 rounded-lg text-[#3d3a55] hover:text-[#8a3030] hover:bg-[#3a1a1a] transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={save} disabled={!title.trim() || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gold text-sm disabled:opacity-40">
            <Save className="w-3.5 h-3.5" />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Título..."
        className="w-full bg-transparent font-serif text-[#e2d9c5] text-2xl placeholder:text-[#3d3a55] outline-none border-b border-[#2e2b42] pb-3 focus:border-[#c9a654] transition-colors" />

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <BookOpen className="w-3.5 h-3.5 text-[#3d3a55] flex-shrink-0" />
          <input value={bibleRef} onChange={e => setBibleRef(e.target.value)}
            placeholder="Referência bíblica"
            className="app-input flex-1 px-3 py-1.5 text-sm" />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <Tag className="w-3.5 h-3.5 text-[#3d3a55] flex-shrink-0" />
          <input value={tags} onChange={e => setTags(e.target.value)}
            placeholder="Tags"
            className="app-input flex-1 px-3 py-1.5 text-sm" />
        </div>
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
