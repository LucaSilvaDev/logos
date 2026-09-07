"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: "personal", label: "Pessoal" },
  { id: "family",   label: "Família" },
  { id: "church",   label: "Igreja" },
  { id: "missions", label: "Missões" },
]

export default function NovaOracaoPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("personal")
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!title.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/oracoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      })
      if (res.ok) router.push("/oracoes")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-2 py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#3d3a55] hover:text-[#8a8375] text-sm transition-colors font-serif">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <button onClick={save} disabled={!title.trim() || saving}
          className="text-link disabled:opacity-30">
          <Save className="w-3.5 h-3.5" /> {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>

      <h1 className="page-title">Nova oração</h1>

      <div className="hairline" />

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Intenção de oração…"
        className="title-field text-[1.25rem]"
      />

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={cn("chip", category === c.id && "chip-on")}>
            {c.label}
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="O que está no seu coração? Deus ouve cada palavra…"
        rows={10}
        className="w-full bg-transparent text-[#8a8375] font-serif text-sm leading-relaxed placeholder:text-[#2e2b42] outline-none resize-none"
      />

      <div className="quote-card quote-card-accent">
        <p className="font-serif text-[15px] italic leading-relaxed">
          &ldquo;Não andeis ansiosos por coisa alguma; antes em tudo apresentai as vossas petições a Deus em oração e súplica, com ação de graças.&rdquo;
        </p>
        <p className="quote-cite mt-3">Filipenses 4:6</p>
      </div>
    </div>
  )
}
