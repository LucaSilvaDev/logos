"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2, BookOpen, ChevronRight, AlertCircle, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SearchResult {
  bookName: string
  bookId:   string
  chapter:  number
  verse:    number
  text:     string
}

function TextWithHighlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase()
  if (!q) return <span>{text}</span>
  const lower = text.toLowerCase()
  const idx   = lower.indexOf(q)
  if (idx === -1) return <span>{text}</span>
  return (
    <>
      <span>{text.slice(0, idx)}</span>
      <mark className="bg-[#c9a65430] text-[#c9a654] rounded-sm not-italic">
        {text.slice(idx, idx + q.length)}
      </mark>
      <span>{text.slice(idx + q.length)}</span>
    </>
  )
}

export default function BuscaBibliaPage() {
  const router = useRouter()
  const [query,   setQuery]   = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError("")
    setSearched(true)
    try {
      const res  = await fetch(`/api/biblia/busca?q=${encodeURIComponent(query.trim())}&version=nvi`)
      const data = await res.json()
      if (data.error) { setError(data.error); setResults([]); return }
      setResults(data.results ?? [])
      setTotal(data.total ?? data.results?.length ?? 0)
    } catch {
      setError("Erro de rede. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  function goToBible(bookId: string, chapter: number) {
    try {
      localStorage.setItem("selah-bible-pos", JSON.stringify({ bookId, chapter, version: "nvi" }))
    } catch { /* ignore */ }
    router.push("/biblia")
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/biblia" className="text-[#3d3a55] hover:text-[#8a8375] transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="font-display text-[9px] text-[#c9a654] uppercase tracking-[0.25em]">Bíblia</p>
          <h1 className="font-serif text-[#c9c0a8] text-lg">Busca de Versículos</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d3a55]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por palavra ou expressão..."
            autoFocus
            className="w-full pl-11 pr-4 py-3 text-sm bg-[#1a1928] border border-[#2e2b42] rounded-xl text-[#c9c0a8] placeholder:text-[#3d3a55] outline-none focus:border-[#c9a654] transition-colors duration-200 font-serif"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Version selector — only NVI has indexed content */}
          <div className="flex items-center gap-1.5">
            <button type="button"
              className="px-3 py-1.5 text-[10px] font-medium tracking-wider rounded-full border bg-[#c9a65415] text-[#c9a654] border-[#c9a65440]"
            >
              NVI
            </button>
            {["NAA", "NVT"].map(label => (
              <span key={label}
                title="Não indexada — busca disponível apenas na NVI"
                className="px-3 py-1.5 text-[10px] font-medium tracking-wider rounded-full border border-transparent text-[#2e2b42] cursor-not-allowed select-none"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="flex-1" />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-gold px-5 py-2 text-xs rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Buscar
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-[#c96b5a] flex-shrink-0" />
          <span className="text-[#55524a]">{error}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && results.length === 0 && !error && (
        <p className="text-[#55524a] text-sm font-serif">Nenhum versículo encontrado para &ldquo;{query}&rdquo;.</p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-[#3d3a55] uppercase tracking-[0.2em]">
            {total > results.length ? `${results.length} de ${total}` : results.length} resultado{results.length !== 1 ? "s" : ""}
          </p>
          {results.map((r, i) => (
            <button key={i}
              onClick={() => goToBible(r.bookId, r.chapter)}
              className="w-full card-soft flex items-start gap-4 px-5 py-4 group text-left"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#3d3a55] mt-0.5 flex-shrink-0 group-hover:text-[#c9a654] transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#c9a654] font-medium tracking-wider uppercase mb-1">
                  {r.bookName} {r.chapter}:{r.verse}
                </p>
                <p className="font-serif text-[#8a8375] text-sm leading-relaxed group-hover:text-[#c9c0a8] transition-colors">
                  <TextWithHighlight text={r.text} query={query} />
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#3d3a55] mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
