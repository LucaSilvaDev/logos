"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, Search, ChevronDown, Maximize2, Minimize2, PenLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { VERSIONS } from "@/lib/bible-reader"
import { getBookCategory } from "@/lib/bible-categories"
import type { BiblePageState } from "@/hooks/useBiblePage"

type Props = Pick<BiblePageState,
  "book" | "chapter" | "version" | "fontSize" | "focusMode" | "chapterNoteOpen" |
  "verseNotes" | "barHidden" | "setVersion" | "setFontSize" | "setFocusMode" | "setShowBookModal" |
  "setShowChapterModal" | "openChapterNote" | "goChapter" | "setDirection"
>

export function BibleControlsBar({
  book, chapter, version, fontSize, focusMode, chapterNoteOpen,
  verseNotes, barHidden, setVersion, setFontSize, setFocusMode,
  setShowBookModal, setShowChapterModal, openChapterNote,
  goChapter, setDirection,
}: Props) {
  const bookCat = getBookCategory(book.id)

  return (
    <div className={cn("bible-float-bar", barHidden && "bible-float-bar-hidden")}>
      <button onClick={() => setShowBookModal(true)} className="bible-ctrl-label">
        <span className="w-3.5 h-3.5 opacity-70 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </span>
        {bookCat && <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-40" />}
        <span className="font-serif text-[15px] text-inherit">{book.name}</span>
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>

      <div className="flex items-center">
        <button onClick={() => goChapter(-1)} title="Capítulo anterior (K)" className="bible-ctrl">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setShowChapterModal(true)} className="bible-ctrl-label">
          <span className="text-[13px] font-medium tabular-nums">{chapter}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
        <button onClick={() => goChapter(1)} title="Próximo capítulo (J)" className="bible-ctrl">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bible-versions">
        <span
          className="bible-version-pill"
          style={{ transform: `translateX(${VERSIONS.findIndex(v => v.id === version) * 100}%)` }}
        />
        {VERSIONS.map(v => (
          <button key={v.id}
            onClick={() => { setDirection("next"); setVersion(v.id) }}
            title={v.desc}
            className={cn("bible-version", version === v.id && "bible-version-active")}>
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex items-center">
        {(["sm", "md", "lg"] as const).map((s, i) => (
          <button key={s} onClick={() => setFontSize(s)}
            className={cn("bible-ctrl", fontSize === s && "bible-ctrl-active",
              s === "sm" && "text-[9px]", s === "md" && "text-[11px]", s === "lg" && "text-[13px]")}
            title={["Texto menor", "Texto médio", "Texto maior"][i]}>
            A
          </button>
        ))}
      </div>

      <Link href="/biblia/busca" className="bible-ctrl" title="Buscar versículos">
        <Search className="w-3.5 h-3.5" />
      </Link>

      <button onClick={openChapterNote} title="Nota do capítulo"
        className={cn("bible-ctrl relative", chapterNoteOpen && "bible-ctrl-active")}>
        <PenLine className="w-3.5 h-3.5" />
        {verseNotes[`${book.id}-${chapter}-0`] && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-current" />
        )}
      </button>

      <button onClick={() => setFocusMode(f => !f)}
        title={focusMode ? "Sair da leitura focada (Esc)" : "Leitura focada"}
        className="bible-ctrl-label">
        {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline text-[13px]">{focusMode ? "Sair" : "Foco"}</span>
      </button>
    </div>
  )
}
