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
          className="flex items-center gap-1.5 text-[#4a3826] hover:text-[#8a8375] text-sm transition-colors font-serif">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <button onClick={save} disabled={!title.trim() || saving}
          className="flex items-center gap-1.5 text-sm text-[#c9a654] hover:opacity-80 transition-opacity font-serif disabled:opacity-30">
          <Save className="w-3.5 h-3.5" /> {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>

      <div>
        <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em] mb-1">Comunhão com Deus</p>
        <h1 className="font-serif text-2xl text-[#e2d9c5] font-normal">Nova Oração</h1>
      </div>

      <div className="h-px bg-[#3a2b1c]" />

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Intenção de oração…"
        className="w-full bg-transparent border-b border-[#3a2b1c] pb-3 text-[#c9c0a8] font-serif text-base placeholder:text-[#4a3826] outline-none focus:border-[#c9a654] transition-colors"
      />

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-serif transition-all",
              category === c.id
                ? "bg-[#c9a65420] text-[#c9a654] border border-[#c9a65440]"
                : "text-[#4a3826] hover:text-[#55524a] border border-[#3a2b1c]"
            )}>
            {c.label}
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="O que está no seu coração? Deus ouve cada palavra…"
        rows={10}
        className="w-full bg-transparent text-[#8a8375] font-serif text-sm leading-relaxed placeholder:text-[#3a2b1c] outline-none resize-none"
      />

      <div className="relative pl-4 py-1">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#c9a654] opacity-20" />
        <p className="font-serif text-[#4a3826] text-xs italic leading-relaxed">
          &ldquo;Não andeis ansiosos por coisa alguma; antes em tudo apresentai as vossas petições a Deus em oração e súplica, com ação de graças.&rdquo;
        </p>
        <p className="text-[#c9a654] text-[10px] mt-1">Filipenses 4:6</p>
      </div>
    </div>
  )
}
