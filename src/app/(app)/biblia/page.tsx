"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ChevronLeft, ChevronRight, Search, Bookmark,
  Highlighter, X, Loader2, AlertCircle, BookOpen, ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"

const BOOKS = [
  { id: "GEN",  name: "Gênesis",           chapters: 50,  testament: "AT" },
  { id: "EXO",  name: "Êxodo",             chapters: 40,  testament: "AT" },
  { id: "LEV",  name: "Levítico",          chapters: 27,  testament: "AT" },
  { id: "NUM",  name: "Números",           chapters: 36,  testament: "AT" },
  { id: "DEU",  name: "Deuteronômio",      chapters: 34,  testament: "AT" },
  { id: "JOS",  name: "Josué",             chapters: 24,  testament: "AT" },
  { id: "JDG",  name: "Juízes",            chapters: 21,  testament: "AT" },
  { id: "RUT",  name: "Rute",              chapters: 4,   testament: "AT" },
  { id: "1SA",  name: "1 Samuel",          chapters: 31,  testament: "AT" },
  { id: "2SA",  name: "2 Samuel",          chapters: 24,  testament: "AT" },
  { id: "1KI",  name: "1 Reis",            chapters: 22,  testament: "AT" },
  { id: "2KI",  name: "2 Reis",            chapters: 25,  testament: "AT" },
  { id: "1CH",  name: "1 Crônicas",        chapters: 29,  testament: "AT" },
  { id: "2CH",  name: "2 Crônicas",        chapters: 36,  testament: "AT" },
  { id: "EZR",  name: "Esdras",            chapters: 10,  testament: "AT" },
  { id: "NEH",  name: "Neemias",           chapters: 13,  testament: "AT" },
  { id: "EST",  name: "Ester",             chapters: 10,  testament: "AT" },
  { id: "JOB",  name: "Jó",               chapters: 42,  testament: "AT" },
  { id: "PSA",  name: "Salmos",            chapters: 150, testament: "AT" },
  { id: "PRO",  name: "Provérbios",        chapters: 31,  testament: "AT" },
  { id: "ECC",  name: "Eclesiastes",       chapters: 12,  testament: "AT" },
  { id: "SNG",  name: "Cânticos",          chapters: 8,   testament: "AT" },
  { id: "ISA",  name: "Isaías",            chapters: 66,  testament: "AT" },
  { id: "JER",  name: "Jeremias",          chapters: 52,  testament: "AT" },
  { id: "LAM",  name: "Lamentações",       chapters: 5,   testament: "AT" },
  { id: "EZK",  name: "Ezequiel",          chapters: 48,  testament: "AT" },
  { id: "DAN",  name: "Daniel",            chapters: 12,  testament: "AT" },
  { id: "HOS",  name: "Oséias",            chapters: 14,  testament: "AT" },
  { id: "JOL",  name: "Joel",              chapters: 3,   testament: "AT" },
  { id: "AMO",  name: "Amós",              chapters: 9,   testament: "AT" },
  { id: "OBA",  name: "Obadias",           chapters: 1,   testament: "AT" },
  { id: "JON",  name: "Jonas",             chapters: 4,   testament: "AT" },
  { id: "MIC",  name: "Miquéias",          chapters: 7,   testament: "AT" },
  { id: "NAH",  name: "Naum",              chapters: 3,   testament: "AT" },
  { id: "HAB",  name: "Habacuque",         chapters: 3,   testament: "AT" },
  { id: "ZEP",  name: "Sofonias",          chapters: 3,   testament: "AT" },
  { id: "HAG",  name: "Ageu",              chapters: 2,   testament: "AT" },
  { id: "ZEC",  name: "Zacarias",          chapters: 14,  testament: "AT" },
  { id: "MAL",  name: "Malaquias",         chapters: 4,   testament: "AT" },
  { id: "MAT",  name: "Mateus",            chapters: 28,  testament: "NT" },
  { id: "MRK",  name: "Marcos",            chapters: 16,  testament: "NT" },
  { id: "LUK",  name: "Lucas",             chapters: 24,  testament: "NT" },
  { id: "JHN",  name: "João",              chapters: 21,  testament: "NT" },
  { id: "ACT",  name: "Atos",              chapters: 28,  testament: "NT" },
  { id: "ROM",  name: "Romanos",           chapters: 16,  testament: "NT" },
  { id: "1CO",  name: "1 Coríntios",       chapters: 16,  testament: "NT" },
  { id: "2CO",  name: "2 Coríntios",       chapters: 13,  testament: "NT" },
  { id: "GAL",  name: "Gálatas",           chapters: 6,   testament: "NT" },
  { id: "EPH",  name: "Efésios",           chapters: 6,   testament: "NT" },
  { id: "PHP",  name: "Filipenses",        chapters: 4,   testament: "NT" },
  { id: "COL",  name: "Colossenses",       chapters: 4,   testament: "NT" },
  { id: "1TH",  name: "1 Tessalonicenses", chapters: 5,   testament: "NT" },
  { id: "2TH",  name: "2 Tessalonicenses", chapters: 3,   testament: "NT" },
  { id: "1TI",  name: "1 Timóteo",         chapters: 6,   testament: "NT" },
  { id: "2TI",  name: "2 Timóteo",         chapters: 4,   testament: "NT" },
  { id: "TIT",  name: "Tito",              chapters: 3,   testament: "NT" },
  { id: "PHM",  name: "Filemom",           chapters: 1,   testament: "NT" },
  { id: "HEB",  name: "Hebreus",           chapters: 13,  testament: "NT" },
  { id: "JAS",  name: "Tiago",             chapters: 5,   testament: "NT" },
  { id: "1PE",  name: "1 Pedro",           chapters: 5,   testament: "NT" },
  { id: "2PE",  name: "2 Pedro",           chapters: 3,   testament: "NT" },
  { id: "1JN",  name: "1 João",            chapters: 5,   testament: "NT" },
  { id: "2JN",  name: "2 João",            chapters: 1,   testament: "NT" },
  { id: "3JN",  name: "3 João",            chapters: 1,   testament: "NT" },
  { id: "JUD",  name: "Judas",             chapters: 1,   testament: "NT" },
  { id: "REV",  name: "Apocalipse",        chapters: 22,  testament: "NT" },
]

const VERSIONS = [
  { id: "nvi",  label: "NVI",   desc: "Nova Versão Internacional" },
  { id: "naa",  label: "NAA",   desc: "Nova Almeida Atualizada" },
  { id: "nvt",  label: "NVT",   desc: "Nova Versão Transformadora" },
  { id: "nbvp", label: "NBV-P", desc: "Nova Bíblia Viva" },
  { id: "acf",  label: "ACF",   desc: "Almeida Corrigida Fiel" },
  { id: "ra",   label: "RA",    desc: "Revista e Atualizada" },
  { id: "blt",  label: "BLT",   desc: "Bíblia Livre de Tradução" },
]

const HL_COLORS = [
  { id: "yellow", style: "#c9a654" },
  { id: "green",  style: "#5a9e72" },
  { id: "blue",   style: "#6b9cca" },
  { id: "red",    style: "#c96b5a" },
]

interface Verse { number: number; text: string }

export default function BibliaPage() {
  const [book, setBook] = useState(BOOKS[0])
  const [chapter, setChapter] = useState(1)
  const [version, setVersion] = useState("nvi")
  const [tab, setTab] = useState<"AT" | "NT">("AT")
  const [filter, setFilter] = useState("")
  const [hlColor, setHlColor] = useState<string | null>(null)
  const [highlighted, setHighlighted] = useState<Record<string, string>>({})
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())
  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<"ERROR" | "AUTH_REQUIRED" | "RATE_LIMIT" | null>(null)
  const [apiDetail, setApiDetail] = useState("")
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [animKey, setAnimKey] = useState(0)
  const [showBookModal, setShowBookModal] = useState(false)

  const filteredBooks = BOOKS.filter(b =>
    b.testament === tab && b.name.toLowerCase().includes(filter.toLowerCase())
  )

  const fetchVerses = useCallback(async () => {
    setLoading(true)
    setApiError(null)
    setVerses([])
    try {
      const res = await fetch(`/api/biblia?book=${book.id}&chapter=${chapter}&version=${version}`)
      const data = await res.json()
      if (data.error === "AUTH_REQUIRED") { setApiError("AUTH_REQUIRED"); return }
      if (data.error === "RATE_LIMIT")    { setApiError("RATE_LIMIT"); return }
      if (!res.ok || data.error) {
        setApiDetail(data.detail ?? data.error ?? `HTTP ${res.status}`)
        setApiError("ERROR")
        return
      }
      setVerses((data.verses ?? []).map((v: { number: number; text: string }) => ({
        number: v.number, text: v.text,
      })))
    } catch {
      setApiError("ERROR")
    } finally {
      setLoading(false)
    }
  }, [book, chapter, version])

  useEffect(() => { fetchVerses() }, [fetchVerses])

  function goChapter(delta: number) {
    const next = chapter + delta
    const bookIdx = BOOKS.findIndex(b => b.id === book.id)

    if (next < 1) {
      if (bookIdx <= 0) return
      const prev = BOOKS[bookIdx - 1]
      setBook(prev)
      setChapter(prev.chapters)
      setDirection("prev")
      setAnimKey(k => k + 1)
      return
    }

    if (next > book.chapters) {
      if (bookIdx >= BOOKS.length - 1) return
      setBook(BOOKS[bookIdx + 1])
      setChapter(1)
      setDirection("next")
      setAnimKey(k => k + 1)
      return
    }

    setDirection(delta > 0 ? "next" : "prev")
    setAnimKey(k => k + 1)
    setChapter(next)
  }

  function changeBook(b: typeof BOOKS[0]) {
    setBook(b)
    setChapter(1)
    setDirection("next")
    setAnimKey(k => k + 1)
  }

  function toggleVerse(key: string) {
    if (!hlColor) return
    setHighlighted(prev => {
      const next = { ...prev }
      if (next[key] === hlColor) delete next[key]
      else next[key] = hlColor
      return next
    })
  }

  function toggleBookmark(key: string) {
    setBookmarked(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const chapterArr = Array.from({ length: book.chapters }, (_, i) => i + 1)
  const isFirstInBible = book.id === "GEN" && chapter === 1
  const isLastInBible  = book.id === "REV" && chapter === book.chapters

  return (
    <div className="relative">
      {/* Controls bar — sticky within the scroll container */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 px-6 py-3 bg-[#12111e]/95 backdrop-blur-md"
        style={{ boxShadow: "0 1px 0 rgba(46,43,66,0.4)" }}>

        {/* Book selector */}
        <button
          onClick={() => setShowBookModal(true)}
          className="flex items-center gap-2 text-[#c9c0a8] hover:text-[#e2d9c5] transition-colors duration-200 group"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#c9a654] opacity-60" />
          <span className="font-serif text-sm">{book.name}</span>
          <ChevronDown className="w-3 h-3 text-[#3d3a55] group-hover:text-[#55524a] transition-colors" />
        </button>

        {/* Chapter navigation */}
        <div className="flex items-center gap-1">
          <button onClick={() => goChapter(-1)}
            className="w-6 h-6 flex items-center justify-center text-[#3d3a55] hover:text-[#c9a654] transition-colors duration-200 rounded-lg hover:bg-[#1a1928]">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <select
            value={chapter}
            onChange={e => { setDirection("next"); setAnimKey(k => k + 1); setChapter(Number(e.target.value)) }}
            className="bg-transparent text-[#8a8375] text-xs outline-none cursor-pointer hover:text-[#c9c0a8] transition-colors px-1 font-serif"
          >
            {chapterArr.map(n => (
              <option key={n} value={n} className="bg-[#1a1928]">Cap. {n}</option>
            ))}
          </select>
          <button onClick={() => goChapter(1)}
            className="w-6 h-6 flex items-center justify-center text-[#3d3a55] hover:text-[#c9a654] transition-colors duration-200 rounded-lg hover:bg-[#1a1928]">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-3.5 bg-[#2e2b42]" />

        {/* Version pills */}
        <div className="flex items-center gap-1">
          {VERSIONS.map(v => (
            <button key={v.id}
              onClick={() => { setDirection("next"); setAnimKey(k => k + 1); setVersion(v.id) }}
              title={v.desc}
              className={cn(
                "px-2.5 py-0.5 text-[10px] font-medium tracking-wider transition-all duration-200 rounded-full border",
                version === v.id
                  ? "bg-[#c9a65415] text-[#c9a654] border-[#c9a65440]"
                  : "text-[#3d3a55] border-transparent hover:text-[#55524a] hover:border-[#2e2b42]"
              )}>
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Highlight tools */}
        <div className="flex items-center gap-1.5">
          <Highlighter className="w-3 h-3 text-[#3d3a55]" />
          {HL_COLORS.map(c => (
            <button key={c.id}
              onClick={() => setHlColor(prev => prev === c.id ? null : c.id)}
              className={cn(
                "w-3.5 h-3.5 rounded-full transition-all duration-200",
                hlColor === c.id ? "ring-1 ring-offset-1 ring-offset-[#12111e] scale-110" : "opacity-40 hover:opacity-70"
              )}
              style={{ background: c.style }} />
          ))}
          {hlColor && (
            <button onClick={() => setHlColor(null)} className="text-[#3d3a55] hover:text-[#55524a] ml-0.5 transition-colors">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Side chapter navigation */}
      {!loading && !apiError && verses.length > 0 && !isFirstInBible && (
        <button
          onClick={() => goChapter(-1)}
          className="chapter-side-nav left-0"
          aria-label="Capítulo anterior"
        >
          <span className="chapter-side-chevron chapter-side-chevron-left" />
        </button>
      )}
      {!loading && !apiError && verses.length > 0 && !isLastInBible && (
        <button
          onClick={() => goChapter(1)}
          className="chapter-side-nav right-0"
          aria-label="Próximo capítulo"
        >
          <span className="chapter-side-chevron chapter-side-chevron-right" />
        </button>
      )}

      {/* Reading area — overflow-x hidden evita que a animação cause scroll lateral */}
      <div className="overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-8 py-12">

        {/* AUTH_REQUIRED */}
        {apiError === "AUTH_REQUIRED" && (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="w-6 h-6 text-[#c9a654] opacity-40 mx-auto" />
            <p className="font-serif text-[#c9c0a8] text-base">Token não carregado</p>
            <p className="text-[#55524a] text-sm leading-relaxed max-w-sm mx-auto">
              Reinicie o servidor de desenvolvimento para carregar o token:<br />
              <code className="text-[#8a8375] font-mono text-xs">Ctrl+C → npm run dev</code>
            </p>
          </div>
        )}

        {/* RATE_LIMIT */}
        {apiError === "RATE_LIMIT" && (
          <div className="relative pl-6 py-4 max-w-sm">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#c9a654] opacity-40" />
            <p className="font-serif text-[#c9a654] text-sm mb-1">Limite de requisições atingido</p>
            <p className="text-[#55524a] text-xs">Aguarde alguns minutos e tente novamente.</p>
          </div>
        )}

        {/* ERROR */}
        {apiError === "ERROR" && (
          <div className="text-center py-16 space-y-2">
            <AlertCircle className="w-6 h-6 text-[#3d3a55] mx-auto mb-3" />
            <p className="font-serif text-[#55524a] text-sm">Não foi possível carregar os versículos.</p>
            {apiDetail && <p className="font-mono text-[10px] text-[#3d3a55]">{apiDetail}</p>}
            <button onClick={fetchVerses} className="text-xs text-[#c9a654] hover:opacity-80 transition-opacity mt-2 block mx-auto">
              Tentar novamente
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-4 h-4 text-[#3d3a55] animate-spin" />
          </div>
        )}

        {/* Bible text with page-turn animation */}
        {!loading && !apiError && verses.length > 0 && (
          <div key={animKey} className={direction === "next" ? "page-turn-next" : "page-turn-prev"}>

            {/* Chapter heading */}
            <div className="text-center mb-12">
              <h1 className="chapter-heading text-base mb-1">{book.name}</h1>
              <p className="font-sans text-[9px] text-[#3d3a55] tracking-[0.25em] uppercase">
                Capítulo {chapter}
              </p>
              <div className="w-12 h-px bg-[#c9a654] opacity-30 mx-auto mt-4" />
            </div>

            {/* Flowing Bible text */}
            <div className="bible-text leading-[2.2]">
              {verses.map(v => {
                const key = `${book.id}-${chapter}-${v.number}`
                const hlCls = highlighted[key] ? `hl-${highlighted[key]}` : ""
                return (
                  <span key={v.number}
                    onClick={() => toggleVerse(key)}
                    className={cn("group relative transition-colors", hlColor && "cursor-pointer", hlCls)}>
                    <sup className="verse-number">{v.number}</sup>
                    <span>{v.text}</span>
                    {" "}
                    <button
                      onClick={e => { e.stopPropagation(); toggleBookmark(key) }}
                      className={cn("inline-flex opacity-0 group-hover:opacity-100 transition-opacity align-middle", bookmarked.has(key) && "opacity-100")}>
                      <Bookmark className={cn("w-2.5 h-2.5", bookmarked.has(key) ? "text-[#c9a654] fill-[#c9a654]" : "text-[#3d3a55]")} />
                    </button>
                    {" "}
                  </span>
                )
              })}
            </div>

            {/* Chapter navigation footer */}
            <div className="flex justify-between mt-16 pt-6" style={{ borderTop: "1px solid rgba(46,43,66,0.4)" }}>
              <button onClick={() => goChapter(-1)} disabled={isFirstInBible}
                className="flex items-center gap-1.5 text-sm font-serif text-[#55524a] hover:text-[#c9a654] disabled:opacity-20 transition-colors duration-200">
                <ChevronLeft className="w-4 h-4" />
                {chapter === 1 ? "Livro anterior" : "Capítulo anterior"}
              </button>
              <button onClick={() => goChapter(1)} disabled={isLastInBible}
                className="flex items-center gap-1.5 text-sm font-serif text-[#55524a] hover:text-[#c9a654] disabled:opacity-20 transition-colors duration-200">
                {chapter === book.chapters ? "Próximo livro" : "Próximo capítulo"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Book selector modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowBookModal(false)}
          />
          <div
            className="relative z-10 w-full max-w-2xl card-soft overflow-hidden flex flex-col modal-enter"
            style={{ maxHeight: "calc(100vh - 96px)" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(46,43,66,0.5)" }}>
              <div className="flex gap-2">
                {(["AT", "NT"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={cn(
                      "font-sans text-[10px] uppercase tracking-[0.2em] transition-all duration-200 px-3 py-1.5 rounded-full border",
                      tab === t
                        ? "bg-[#c9a65415] text-[#c9a654] border-[#c9a65440]"
                        : "text-[#3d3a55] border-transparent hover:text-[#55524a] hover:border-[#2e2b42]"
                    )}>
                    {t === "AT" ? "Antigo Testamento" : "Novo Testamento"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className="text-[#3d3a55] hover:text-[#8a8375] transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-3" style={{ borderBottom: "1px solid rgba(46,43,66,0.5)" }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3d3a55]" />
                <input
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  placeholder="Buscar livro..."
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 text-sm bg-[#1a1928] border border-[#2e2b42] rounded-xl text-[#8a8375] placeholder:text-[#3d3a55] outline-none focus:border-[#c9a654] transition-colors duration-200 font-serif"
                />
              </div>
            </div>

            {/* Book grid */}
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {filteredBooks.map(b => (
                  <button key={b.id}
                    onClick={() => { changeBook(b); setShowBookModal(false); setFilter("") }}
                    className={cn(
                      "px-3 py-2 text-left text-sm font-serif rounded-xl transition-all duration-200",
                      book.id === b.id
                        ? "bg-[#c9a65415] text-[#c9a654] border border-[#c9a65440]"
                        : "text-[#55524a] hover:text-[#c9c0a8] hover:bg-[#1a1928] border border-transparent"
                    )}>
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
