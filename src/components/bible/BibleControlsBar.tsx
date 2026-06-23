"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, Search, ChevronDown, Maximize2, Minimize2, PenLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { VERSIONS } from "@/lib/bible-reader"
import { BOOK_CATEGORIES, getBookCategory } from "@/lib/bible-categories"
import type { BiblePageState } from "@/hooks/useBiblePage"

type Props = Pick<BiblePageState,
  "book" | "chapter" | "version" | "fontSize" | "focusMode" | "chapterNoteOpen" |
  "verseNotes" | "setVersion" | "setFontSize" | "setFocusMode" | "setShowBookModal" |
  "setShowChapterModal" | "openChapterNote" | "goChapter" | "animKey" | "setAnimKey" | "direction" | "setDirection"
>

export function BibleControlsBar({
  book, chapter, version, fontSize, focusMode, chapterNoteOpen,
  verseNotes, setVersion, setFontSize, setFocusMode,
  setShowBookModal, setShowChapterModal, openChapterNote,
  goChapter, setAnimKey, setDirection,
}: Props) {
  const bookCat = getBookCategory(book.id)

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 px-6 py-3 bg-[#12111e]/90 backdrop-blur-xl">

      <button onClick={() => setShowBookModal(true)}
        className="flex items-center gap-2 text-[#c9c0a8] hover:text-[#e2d9c5] transition-colors duration-200 group">
        <span className="w-3.5 h-3.5 text-[#c9a654] opacity-60 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </span>
        {bookCat && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: BOOK_CATEGORIES[bookCat.category].color }} />}
        <span className="font-serif text-sm">{book.name}</span>
        <ChevronDown className="w-3 h-3 text-[#3d3a55] group-hover:text-[#55524a] transition-colors" />
      </button>

      <div className="flex items-center gap-1">
        <button onClick={() => goChapter(-1)} title="Capítulo anterior (K)"
          className="w-6 h-6 flex items-center justify-center text-[#3d3a55] hover:text-[#c9a654] transition-colors rounded-lg hover:bg-[#1a1928]">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setShowChapterModal(true)}
          className="flex items-center gap-1 text-[#8a8375] hover:text-[#c9c0a8] transition-colors px-1 group">
          <span className="font-serif text-xs">Cap. {chapter}</span>
          <ChevronDown className="w-3 h-3 text-[#3d3a55] group-hover:text-[#55524a] transition-colors" />
        </button>
        <button onClick={() => goChapter(1)} title="Próximo capítulo (J)"
          className="w-6 h-6 flex items-center justify-center text-[#3d3a55] hover:text-[#c9a654] transition-colors rounded-lg hover:bg-[#1a1928]">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-px h-3.5 bg-[#2e2b42]" />

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

      <div className="flex items-center gap-0.5">
        {(["sm", "md", "lg"] as const).map((s, i) => (
          <button key={s} onClick={() => setFontSize(s)}
            className={cn(
              "w-6 h-5 flex items-center justify-center rounded transition-colors",
              fontSize === s ? "text-[#c9a654]" : "text-[#3d3a55] hover:text-[#55524a]",
              s === "sm" && "text-[9px]", s === "md" && "text-[11px]", s === "lg" && "text-[13px]",
            )}
            title={["Texto menor", "Texto médio", "Texto maior"][i]}>
            A
          </button>
        ))}
      </div>

      <div className="w-px h-3.5 bg-[#2e2b42]" />

      <Link href="/biblia/busca" className="text-[#3d3a55] hover:text-[#c9a654] transition-colors duration-200" title="Buscar versículos">
        <Search className="w-3.5 h-3.5" />
      </Link>

      <div className="w-px h-3.5 bg-[#2e2b42]" />

      <button onClick={openChapterNote} title="Nota do capítulo"
        className={cn("relative transition-colors duration-200", chapterNoteOpen ? "text-[#c9a654]" : "text-[#3d3a55] hover:text-[#c9a654]")}>
        <PenLine className="w-3.5 h-3.5" />
        {verseNotes[`${book.id}-${chapter}-0`] && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#c9a654]" />
        )}
      </button>

      <div className="w-px h-3.5 bg-[#2e2b42]" />

      <button onClick={() => setFocusMode(f => !f)}
        title={focusMode ? "Sair da leitura focada (Esc)" : "Leitura focada"}
        className="text-[#3d3a55] hover:text-[#c9a654] transition-colors duration-200">
        {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}
