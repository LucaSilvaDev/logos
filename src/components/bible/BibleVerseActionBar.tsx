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
  const actionBtn = "flex flex-col items-center gap-1 flex-1 py-1.5 rounded-xl text-[10px] text-[#8a8375] active:bg-white/5 transition-all"

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[300] animate-slide-up"
      style={{
        background: "rgba(18,18,20,0.97)",
        backdropFilter: "blur(48px) saturate(1.8)",
        WebkitBackdropFilter: "blur(48px) saturate(1.8)",
        borderTop: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      {/* Row 1 — reference + highlight colors + close */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <span className="text-[#c9a654] text-[12px] font-serif font-medium shrink-0">{selectionRef()}</span>
        <div className="w-px h-4 bg-white/10 shrink-0 mx-0.5" />
        <div className="flex items-center gap-2.5 flex-1">
          {HL_COLORS.map(c => (
            <button key={c.id} onClick={() => applyHighlightColor(c.id)} title={c.id}
              className={cn("w-7 h-7 rounded-full shrink-0 transition-all duration-150 active:scale-90", allSameColor(c.id) && "ring-2 ring-white/60 scale-110")}
              style={{ background: c.style }} />
          ))}
          {anyHighlighted && (
            <button onClick={removeHighlightSelection} title="Remover grifo"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-[#55524a] active:text-[#c96b5a] transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button onClick={() => setSelectedVerses(new Set())}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-[#3d3a55] active:text-[#8a8375] transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mx-4 h-px bg-white/5" />

      {/* Row 2 — actions */}
      <div className="flex items-center px-2 pt-1">
        <button
          onClick={() => { sortedNums.forEach(vn => toggleBookmark(`${book.id}-${chapter}-${vn}`, vn)); setSelectedVerses(new Set()) }}
          className={actionBtn}>
          <Bookmark className={cn("w-5 h-5", anyBookmarked ? "text-[#c9a654] fill-[#c9a654]" : "text-[#8a8375]")} />
          <span className={anyBookmarked ? "text-[#c9a654]" : ""}>Marcador</span>
        </button>

        <button onClick={copyVerse} className={actionBtn}>
          {copied ? <Check className="w-5 h-5 text-[#5a9e72]" /> : <Copy className="w-5 h-5" />}
          <span className={copied ? "text-[#5a9e72]" : ""}>{copied ? "Copiado!" : "Copiar"}</span>
        </button>

        <button onClick={() => { openNote(sortedNums[0]); setSelectedVerses(new Set()) }} className={actionBtn}>
          <MessageSquare className={cn("w-5 h-5", verseNotes[`${book.id}-${chapter}-${sortedNums[0]}`] ? "text-[#c9a654]" : "text-[#8a8375]")} />
          <span className={verseNotes[`${book.id}-${chapter}-${sortedNums[0]}`] ? "text-[#c9a654]" : ""}>Nota</span>
        </button>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <button onClick={shareVerse} className={actionBtn}>
            <Share2 className="w-5 h-5" /><span>Compartilhar</span>
          </button>
        )}

        <button onClick={downloadVerseImage} className={actionBtn}>
          <Download className="w-5 h-5" /><span>Imagem</span>
        </button>

        <button onClick={() => { fetchCompare(sortedNums[0]); setSelectedVerses(new Set()) }} className={actionBtn}>
          <ArrowLeftRight className="w-5 h-5" /><span>Comparar</span>
        </button>
      </div>
    </div>
  )
}
