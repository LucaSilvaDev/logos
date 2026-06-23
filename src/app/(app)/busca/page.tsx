"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ScanSearch, BookOpen, NotebookPen, Search, Heart, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SearchResult } from "@/app/api/search/route"

type FilterType = "todos" | "verse" | "devocional" | "estudo" | "oracao"

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  verse:      { label: "Bíblia",     icon: BookOpen,    color: "#c9a654" },
  devocional: { label: "Devocional", icon: NotebookPen, color: "#7a9e7e" },
  estudo:     { label: "Estudo",     icon: Search,      color: "#7a8fa8" },
  oracao:     { label: "Oração",     icon: Heart,       color: "#a87a7a" },
}

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "todos",      label: "Todos" },
  { id: "verse",      label: "Bíblia" },
  { id: "devocional", label: "Devocional" },
  { id: "estudo",     label: "Estudo" },
  { id: "oracao",     label: "Oração" },
]

function highlight(text: string, query: string) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#c9a654]/20 text-[#c9a654] rounded-sm px-px">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function BuscaPage() {
  const [query, setQuery]     = useState("")
  const [filter, setFilter]   = useState<FilterType>("todos")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = res.ok ? await res.json() : []
      setResults(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(query.trim()), 350)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, search])

  useEffect(() => { inputRef.current?.focus() }, [])

  const filtered = filter === "todos" ? results : results.filter(r => r.type === filter)

  const countByType = (type: string) => results.filter(r => r.type === type).length

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <ScanSearch className="w-5 h-5 text-[#c9a654] opacity-60 shrink-0" />
        <div>
          <h1 className="font-display text-[#e2d9c5] text-lg tracking-[0.15em] uppercase">Busca</h1>
          <p className="text-[#55524a] text-[11px] mt-0.5 font-sans">Devocionais · Estudos · Orações · Versículos</p>
        </div>
      </div>

      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d3a55] pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar palavra, versículo, título…"
          className={cn(
            "w-full pl-11 pr-10 py-3.5 rounded-2xl text-[14px] font-sans",
            "bg-[#1a1928] border border-[#2e2b42] text-[#e2d9c5]",
            "placeholder:text-[#3d3a55] outline-none",
            "focus:border-[#c9a654]/40 focus:ring-1 focus:ring-[#c9a654]/20 transition-all",
          )}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setSearched(false); inputRef.current?.focus() }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3d3a55] hover:text-[#8a8375] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter pills */}
      {results.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map(f => {
            const count = f.id === "todos" ? results.length : countByType(f.id)
            if (f.id !== "todos" && count === 0) return null
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-sans transition-all border",
                  filter === f.id
                    ? "bg-[#c9a654]/15 border-[#c9a654]/40 text-[#c9a654]"
                    : "border-[#2e2b42] text-[#55524a] hover:border-[#3d3a55] hover:text-[#8a8375]"
                )}
              >
                {f.label}
                <span className="ml-1.5 opacity-60">{count}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="flex items-center gap-2 text-[#3d3a55] text-sm py-8 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="font-sans text-[12px]">Buscando…</span>
        </div>
      )}

      {!loading && searched && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#3d3a55] text-sm font-serif italic">Nenhum resultado para "{query}"</p>
          <p className="text-[#2e2b42] text-[11px] mt-2 font-sans">
            Tente palavras-chave diferentes ou verifique a ortografia
          </p>
        </div>
      )}

      {!loading && !searched && (
        <div className="text-center py-16">
          <p className="text-[#2e2b42] text-[11px] font-sans tracking-wide uppercase">
            Digite para começar a busca
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(result => {
            const meta = TYPE_META[result.type]
            const Icon = meta.icon
            return (
              <Link
                key={result.id}
                href={result.url}
                className="group block card-soft px-5 py-4 rounded-2xl hover:border-[#c9a654]/20 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${meta.color}18` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[9px] font-display uppercase tracking-[0.2em] opacity-60"
                        style={{ color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      {result.meta && (
                        <span className="text-[10px] text-[#3d3a55] font-sans">{result.meta}</span>
                      )}
                    </div>

                    <p className="text-[#c9c0a8] text-sm font-serif group-hover:text-[#e2d9c5] transition-colors leading-snug truncate">
                      {highlight(result.title, query)}
                    </p>

                    {result.excerpt && (
                      <p className="text-[#55524a] text-[12px] font-sans mt-1 leading-relaxed line-clamp-2">
                        {highlight(result.excerpt, query)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
