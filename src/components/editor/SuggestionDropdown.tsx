"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { BookOpen, FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SuggestionState } from "@/hooks/useEditorSuggestion"

// ─── Bible books with PT-BR abbreviation + display name ──────────────────────

interface BibleBook { abbr: string; name: string; group: string }

const BIBLE_BOOKS: BibleBook[] = [
  // AT
  { abbr: "Gn",   name: "Gênesis",          group: "AT" },
  { abbr: "Ex",   name: "Êxodo",            group: "AT" },
  { abbr: "Lv",   name: "Levítico",         group: "AT" },
  { abbr: "Nm",   name: "Números",          group: "AT" },
  { abbr: "Dt",   name: "Deuteronômio",     group: "AT" },
  { abbr: "Js",   name: "Josué",            group: "AT" },
  { abbr: "Jz",   name: "Juízes",           group: "AT" },
  { abbr: "Rt",   name: "Rute",             group: "AT" },
  { abbr: "1Sm",  name: "1 Samuel",         group: "AT" },
  { abbr: "2Sm",  name: "2 Samuel",         group: "AT" },
  { abbr: "1Rs",  name: "1 Reis",           group: "AT" },
  { abbr: "2Rs",  name: "2 Reis",           group: "AT" },
  { abbr: "1Cr",  name: "1 Crônicas",       group: "AT" },
  { abbr: "2Cr",  name: "2 Crônicas",       group: "AT" },
  { abbr: "Ed",   name: "Esdras",           group: "AT" },
  { abbr: "Ne",   name: "Neemias",          group: "AT" },
  { abbr: "Et",   name: "Ester",            group: "AT" },
  { abbr: "Jó",   name: "Jó",               group: "AT" },
  { abbr: "Sl",   name: "Salmos",           group: "AT" },
  { abbr: "Pv",   name: "Provérbios",       group: "AT" },
  { abbr: "Ec",   name: "Eclesiastes",      group: "AT" },
  { abbr: "Ct",   name: "Cânticos",         group: "AT" },
  { abbr: "Is",   name: "Isaías",           group: "AT" },
  { abbr: "Jr",   name: "Jeremias",         group: "AT" },
  { abbr: "Lm",   name: "Lamentações",      group: "AT" },
  { abbr: "Ez",   name: "Ezequiel",         group: "AT" },
  { abbr: "Dn",   name: "Daniel",           group: "AT" },
  { abbr: "Os",   name: "Oséias",           group: "AT" },
  { abbr: "Jl",   name: "Joel",             group: "AT" },
  { abbr: "Am",   name: "Amós",             group: "AT" },
  { abbr: "Ob",   name: "Obadias",          group: "AT" },
  { abbr: "Jn",   name: "Jonas",            group: "AT" },
  { abbr: "Mq",   name: "Miquéias",         group: "AT" },
  { abbr: "Na",   name: "Naum",             group: "AT" },
  { abbr: "Hc",   name: "Habacuque",        group: "AT" },
  { abbr: "Sf",   name: "Sofonias",         group: "AT" },
  { abbr: "Ag",   name: "Ageu",             group: "AT" },
  { abbr: "Zc",   name: "Zacarias",         group: "AT" },
  { abbr: "Ml",   name: "Malaquias",        group: "AT" },
  // NT
  { abbr: "Mt",   name: "Mateus",           group: "NT" },
  { abbr: "Mc",   name: "Marcos",           group: "NT" },
  { abbr: "Lc",   name: "Lucas",            group: "NT" },
  { abbr: "Jo",   name: "João",             group: "NT" },
  { abbr: "At",   name: "Atos",             group: "NT" },
  { abbr: "Rm",   name: "Romanos",          group: "NT" },
  { abbr: "1Co",  name: "1 Coríntios",      group: "NT" },
  { abbr: "2Co",  name: "2 Coríntios",      group: "NT" },
  { abbr: "Gl",   name: "Gálatas",          group: "NT" },
  { abbr: "Ef",   name: "Efésios",          group: "NT" },
  { abbr: "Fp",   name: "Filipenses",       group: "NT" },
  { abbr: "Cl",   name: "Colossenses",      group: "NT" },
  { abbr: "1Ts",  name: "1 Tessalonicenses",group: "NT" },
  { abbr: "2Ts",  name: "2 Tessalonicenses",group: "NT" },
  { abbr: "1Tm",  name: "1 Timóteo",        group: "NT" },
  { abbr: "2Tm",  name: "2 Timóteo",        group: "NT" },
  { abbr: "Tt",   name: "Tito",             group: "NT" },
  { abbr: "Fm",   name: "Filêmon",          group: "NT" },
  { abbr: "Hb",   name: "Hebreus",          group: "NT" },
  { abbr: "Tg",   name: "Tiago",            group: "NT" },
  { abbr: "1Pe",  name: "1 Pedro",          group: "NT" },
  { abbr: "2Pe",  name: "2 Pedro",          group: "NT" },
  { abbr: "1Jo",  name: "1 João",           group: "NT" },
  { abbr: "2Jo",  name: "2 João",           group: "NT" },
  { abbr: "3Jo",  name: "3 João",           group: "NT" },
  { abbr: "Jd",   name: "Judas",            group: "NT" },
  { abbr: "Ap",   name: "Apocalipse",       group: "NT" },
]

function matchBooks(query: string): BibleBook[] {
  if (!query) return BIBLE_BOOKS.slice(0, 8)
  const q = query.toLowerCase()
  return BIBLE_BOOKS.filter(b =>
    b.abbr.toLowerCase().startsWith(q) ||
    b.name.toLowerCase().startsWith(q) ||
    b.name.toLowerCase().includes(q)
  ).slice(0, 8)
}

// ─── Note result type ─────────────────────────────────────────────────────────

interface NoteItem { id: string; title: string; book: string }

// ─── Dropdown ─────────────────────────────────────────────────────────────────

interface Props {
  suggestion: SuggestionState
  onAccept: (text: string) => void
  onDismiss: () => void
}

export function SuggestionDropdown({ suggestion, onAccept, onDismiss }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [notes, setNotes]         = useState<NoteItem[]>([])
  const [loading, setLoading]     = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  // ── fetch notes when type === note ──────────────────────────────────────────
  useEffect(() => {
    if (suggestion.type !== "note") return
    setLoading(true)
    const ctrl = new AbortController()
    fetch(`/api/search?q=${encodeURIComponent(suggestion.query || " ")}`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : [])
      .then((data: { id: string; type: string; title: string; meta?: string }[]) => {
        setNotes(data.filter(d => d.type === "estudo").map(d => ({ id: d.id, title: d.title, book: d.meta ?? "" })))
        setLoading(false)
      })
      .catch(() => setLoading(false))
    return () => ctrl.abort()
  }, [suggestion.type, suggestion.query])

  // ── items depending on type ──────────────────────────────────────────────────
  const bookItems  = suggestion.type === "verse" ? matchBooks(suggestion.query) : []
  const totalItems = suggestion.type === "verse" ? bookItems.length : notes.length

  // reset active index when items change
  useEffect(() => setActiveIdx(0), [suggestion.query])

  // ── keyboard handler ─────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(e.key)) return
      e.preventDefault()
      e.stopPropagation()

      if (e.key === "Escape") { onDismiss(); return }
      if (e.key === "ArrowDown") { setActiveIdx(i => (i + 1) % Math.max(1, totalItems)); return }
      if (e.key === "ArrowUp")   { setActiveIdx(i => (i - 1 + Math.max(1, totalItems)) % Math.max(1, totalItems)); return }
      if (e.key === "Enter" || e.key === "Tab") {
        if (suggestion.type === "verse" && bookItems[activeIdx]) {
          onAccept(`@${bookItems[activeIdx].abbr} `)
        } else if (suggestion.type === "note" && notes[activeIdx]) {
          onAccept(`[[${notes[activeIdx].title}]]`)
        }
      }
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [activeIdx, bookItems, notes, suggestion.type, onAccept, onDismiss, totalItems])

  // ── scroll active item into view ─────────────────────────────────────────────
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`) as HTMLElement | null
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIdx])

  // ── position ─────────────────────────────────────────────────────────────────
  const { coords } = suggestion
  const top  = coords.bottom + window.scrollY + 6
  const left = coords.left   + window.scrollX

  const label = suggestion.type === "verse"
    ? suggestion.query ? `Livro "${suggestion.query}"` : "Selecione um livro"
    : suggestion.query ? `Nota "${suggestion.query}"` : "Suas notas de estudo"

  return createPortal(
    <div
      className="fixed z-[9999] w-64 rounded-2xl overflow-hidden shadow-2xl border border-[#2e2b42]"
      style={{
        top,
        left,
        background: "rgba(18,17,30,0.97)",
        backdropFilter: "blur(24px)",
      }}
      onMouseDown={e => e.preventDefault()}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2e2b42]/60">
        {suggestion.type === "verse"
          ? <BookOpen className="w-3 h-3 text-[#c9a654] opacity-60" />
          : <FileText  className="w-3 h-3 text-[#7a9e7e] opacity-60" />
        }
        <span className="text-[9px] font-display uppercase tracking-[0.2em] text-[#3d3a55]">
          {label}
        </span>
      </div>

      {/* Items */}
      <div ref={listRef} className="max-h-52 overflow-y-auto">
        {loading && (
          <div className="flex items-center gap-2 px-3 py-3 text-[#3d3a55]">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-[11px] font-sans">Buscando…</span>
          </div>
        )}

        {suggestion.type === "verse" && bookItems.map((book, i) => (
          <button
            key={book.abbr}
            data-idx={i}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
              i === activeIdx ? "bg-[#c9a654]/10" : "hover:bg-[#1a1928]"
            )}
            onMouseEnter={() => setActiveIdx(i)}
            onClick={() => onAccept(`@${book.abbr} `)}
          >
            <span className="w-9 text-[11px] font-display text-[#c9a654] opacity-80 shrink-0">{book.abbr}</span>
            <span className="text-[12px] font-serif text-[#c9c0a8] truncate">{book.name}</span>
            <span className="ml-auto text-[9px] text-[#3d3a55] shrink-0">{book.group}</span>
          </button>
        ))}

        {suggestion.type === "verse" && !loading && bookItems.length === 0 && (
          <p className="px-3 py-3 text-[11px] text-[#3d3a55] font-sans italic">Nenhum livro encontrado</p>
        )}

        {suggestion.type === "note" && !loading && notes.map((note, i) => (
          <button
            key={note.id}
            data-idx={i}
            className={cn(
              "w-full flex flex-col gap-0.5 px-3 py-2 text-left transition-colors",
              i === activeIdx ? "bg-[#7a9e7e]/10" : "hover:bg-[#1a1928]"
            )}
            onMouseEnter={() => setActiveIdx(i)}
            onClick={() => onAccept(`[[${note.title}]]`)}
          >
            <span className="text-[12px] font-serif text-[#c9c0a8] truncate">{note.title}</span>
            {note.book && <span className="text-[10px] text-[#3d3a55]">{note.book}</span>}
          </button>
        ))}

        {suggestion.type === "note" && !loading && notes.length === 0 && (
          <p className="px-3 py-3 text-[11px] text-[#3d3a55] font-sans italic">
            {suggestion.query ? "Nenhuma nota encontrada" : "Digite para buscar notas"}
          </p>
        )}
      </div>

      {/* Footer hint */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-t border-[#2e2b42]/60">
        <span className="text-[9px] text-[#3d3a55] font-sans">↑↓ navegar</span>
        <span className="text-[9px] text-[#3d3a55] font-sans">Enter selecionar</span>
        <span className="text-[9px] text-[#3d3a55] font-sans ml-auto">Esc fechar</span>
      </div>
    </div>,
    document.body
  )
}
