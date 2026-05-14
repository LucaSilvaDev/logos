"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2, BookOpen, ChevronRight, AlertCircle, ChevronLeft, Database } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SearchResult {
  bookName: string
  bookId:   string
  chapter:  number
  verse:    number
  text:     string
}

const VERSIONS = [
  { id: "nvi",    label: "NVI" },
  { id: "naa",    label: "NAA" },
  { id: "nvt",    label: "NVT" },
]

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
  const [version, setVersion] = useState("nvi")
  const [results, setResults] = useState<SearchResult[]>([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [searched, setSearched] = useState(false)
  const [indexedCount, setIndexedCount] = useState<number | null>(null)

  // Load indexed count on mount
  useState(() => {
    fetch(`/api/biblia/busca?q=&version=${version}`)
      .then(r => r.json())
      .then(d => setIndexedCount(d.indexedCount ?? null))
      .catch(() => {})
  })

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError("")
    setSearched(true)
    try {
      const res  = await fetch(`/api/biblia/busca?q=${encodeURIComponent(query.trim())}&version=${version}`)
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
      localStorage.setItem("selah-bible-pos", JSON.stringify({ bookId, chapter, version }))
    } catch { /* ignore */ }
    router.push("/biblia")
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/biblia" className="text-[#4a3826] hover:text-[#8a8375] transition-colors">
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a3826]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por palavra ou expressão..."
            autoFocus
            className="w-full pl-11 pr-4 py-3 text-sm bg-[#231a12] border border-[#3a2b1c] rounded-xl text-[#c9c0a8] placeholder:text-[#4a3826] outline-none focus:border-[#c9a654] transition-colors duration-200 font-serif"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {VERSIONS.map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVersion(v.id)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-medium tracking-wider rounded-full border transition-colors",
                  version === v.id
                    ? "bg-[#c9a65415] text-[#c9a654] border-[#c9a65440]"
                    : "border-[#3a2b1c] text-[#4a3826] hover:text-[#55524a]"
                )}
              >
                {v.label}
              </button>
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

      {/* Indexed count hint — before any search */}
      {!searched && indexedCount !== null && (
        <div className="flex items-center gap-2 text-xs text-[#4a3826]">
          <Database className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {indexedCount > 0
              ? `${indexedCount.toLocaleString("pt-BR")} versículos indexados em ${VERSIONS.find(v => v.id === version)?.label} — leia mais capítulos para expandir.`
              : `Nenhum versículo indexado ainda em ${VERSIONS.find(v => v.id === version)?.label}. Leia alguns capítulos na Bíblia para começar.`
            }
          </span>
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && results.length === 0 && !error && (
        <div className="space-y-2">
          <p className="text-[#55524a] text-sm font-serif">
            Nenhum versículo encontrado para &ldquo;{query}&rdquo; em {VERSIONS.find(v => v.id === version)?.label}.
          </p>
          <div className="flex items-start gap-2 text-xs text-[#4a3826]">
            <Database className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              A busca usa versículos já lidos. Acesse mais capítulos na versão{" "}
              {VERSIONS.find(v => v.id === version)?.label} para indexá-los.
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-[#4a3826] uppercase tracking-[0.2em]">
            {total > results.length ? `${results.length} de ${total}` : results.length} resultado{results.length !== 1 ? "s" : ""}
          </p>
          <div className="divide-y divide-[#231a12]">
            {results.map((r, i) => (
              <button key={i}
                onClick={() => goToBible(r.bookId, r.chapter)}
                className="w-full group flex items-start gap-4 px-2 py-4 text-left hover:bg-[linear-gradient(90deg,rgba(201,166,84,0.05),transparent)] rounded-xl transition-all duration-300"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#3a2b1c] mt-0.5 flex-shrink-0 group-hover:text-[#c9a654] transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#c9a654] font-medium tracking-wider uppercase mb-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                    {r.bookName} {r.chapter}:{r.verse}
                  </p>
                  <p className="font-serif text-[#55524a] text-sm leading-relaxed group-hover:text-[#c9c0a8] transition-colors">
                    <TextWithHighlight text={r.text} query={query} />
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#4a3826] mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
