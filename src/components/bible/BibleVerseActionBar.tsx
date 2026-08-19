"use client"

import { X, Trash2, Bookmark, Copy, Check, MessageSquare, Share2, Download, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { HL_COLORS } from "@/lib/bible-reader"
import type { BiblePageState } from "@/hooks/useBiblePage"

type Props = Pick<BiblePageState,
  "book" | "chapter" | "selectedVerses" | "highlighted" | "bookmarked" |
  "verseNotes" | "copied" | "setSelectedVerses" |
  "selectionRef" | "copyVerse" | "shareVerse" | "downloadVerseImage" |
  "applyHighlightColor" | "removeHighlightSelection" | "toggleBookmark" |
  "openNote" | "fetchCompare"
>

export function BibleVerseActionBar({
  book, chapter, selectedVerses, highlighted, bookmarked, verseNotes,
  copied, setSelectedVerses,
  selectionRef, copyVerse, shareVerse, downloadVerseImage,
  applyHighlightColor, removeHighlightSelection, toggleBookmark,
  openNote, fetchCompare,
}: Props) {
  if (!selectedVerses.size) return null

  const sortedNums   = [...selectedVerses].sort((a, b) => a - b)
  const anyHighlighted = sortedNums.some(vn => !!highlighted[`${book.id}-${chapter}-${vn}`])
  const allSameColor   = (color: string) => sortedNums.every(vn => highlighted[`${book.id}-${chapter}-${vn}`]?.color === color)
  const anyBookmarked  = sortedNums.some(vn => `${book.id}-${chapter}-${vn}` in bookmarked)

  return (
    <div className="bible-verse-bar">
      <div className="flex items-center gap-2 px-1 pb-2">
        <span className="bible-verse-bar-ref shrink-0">{selectionRef()}</span>
        <div className="flex items-center gap-2.5 flex-1">
          {HL_COLORS.map(c => (
            <button key={c.id} onClick={() => applyHighlightColor(c.id)} title={c.id}
              className={cn("w-7 h-7 rounded-full shrink-0 transition-transform duration-150", allSameColor(c.id) && "ring-2 ring-current scale-110")}
              style={{ background: c.style }} />
          ))}
          {anyHighlighted && (
            <button onClick={removeHighlightSelection} title="Remover grifo" className="bible-ctrl">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button onClick={() => setSelectedVerses(new Set())} className="bible-ctrl shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center">
        <button
          onClick={() => { sortedNums.forEach(vn => toggleBookmark(`${book.id}-${chapter}-${vn}`, vn)); setSelectedVerses(new Set()) }}
          className={cn("bible-verse-action", anyBookmarked && "text-inherit")}>
          <Bookmark className={cn("w-5 h-5", anyBookmarked && "fill-current")} />
          <span>Marcador</span>
        </button>

        <button onClick={copyVerse} className="bible-verse-action">
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          <span>{copied ? "Copiado" : "Copiar"}</span>
        </button>

        <button onClick={() => { openNote(sortedNums[0]); setSelectedVerses(new Set()) }} className="bible-verse-action">
          <MessageSquare className="w-5 h-5" />
          <span>Nota</span>
        </button>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <button onClick={shareVerse} className="bible-verse-action">
            <Share2 className="w-5 h-5" /><span>Compartilhar</span>
          </button>
        )}

        <button onClick={downloadVerseImage} className="bible-verse-action">
          <Download className="w-5 h-5" /><span>Imagem</span>
        </button>

        <button onClick={() => { fetchCompare(sortedNums[0]); setSelectedVerses(new Set()) }} className="bible-verse-action">
          <ArrowLeftRight className="w-5 h-5" /><span>Comparar</span>
        </button>
      </div>
    </div>
  )
}
