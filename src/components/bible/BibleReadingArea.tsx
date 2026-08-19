"use client"

import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { BOOK_CATEGORIES, getBookCategory } from "@/lib/bible-categories"
import type { BiblePageState } from "@/hooks/useBiblePage"

type Props = Pick<BiblePageState,
  "book" | "chapter" | "version" | "fontSize" | "verses" | "loading" |
  "apiError" | "apiDetail" | "direction" | "animKey" | "highlighted" |
  "verseNotes" | "selectedVerses" | "readChapters" | "readSaving" |
  "isFirstInBible" | "isLastInBible" |
  "touchStartX" | "touchStartY" |
  "fetchVerses" | "goChapter" | "handleVerseClick" | "toggleRead"
>

export function BibleReadingArea({
  book, chapter, fontSize, verses, loading, apiError, apiDetail,
  direction, animKey, highlighted, verseNotes, selectedVerses,
  readChapters, readSaving, isFirstInBible, isLastInBible,
  touchStartX, touchStartY,
  fetchVerses, goChapter, handleVerseClick, toggleRead,
}: Props) {
  const bookCat = getBookCategory(book.id)
  const isRead  = readChapters.has(`${book.id}-${chapter}`)
  const progress = Math.max(0.04, chapter / book.chapters)

  return (
    <div
      className="overflow-x-hidden"
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchStartX.current
        const dy = e.changedTouches[0].clientY - touchStartY.current
        if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 60) {
          if (dx < 0 && !isLastInBible)  goChapter(1)
          else if (dx > 0 && !isFirstInBible) goChapter(-1)
        }
      }}
    >
      <div className="max-w-2xl mx-auto px-6 sm:px-8 py-8 sm:py-12">

        {apiError === "AUTH_REQUIRED" && (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="w-6 h-6 text-[#c9a654] opacity-40 mx-auto" />
            <p className="font-serif text-base">Chave de API não configurada</p>
            <p className="text-sm leading-relaxed max-w-sm mx-auto text-[#777b86]">
              Verifique as variáveis de ambiente no servidor.
            </p>
          </div>
        )}

        {apiError === "NOT_LICENSED" && (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="w-6 h-6 text-[#c9a654] opacity-40 mx-auto" />
            <p className="font-serif text-base">Versão não disponível para este livro</p>
            <p className="text-sm leading-relaxed max-w-sm mx-auto text-[#777b86]">
              A licença desta versão não cobre este livro. Aceite a licença completa em{" "}
              <span className="font-mono text-xs">platform.youversion.com</span>
            </p>
            <button onClick={fetchVerses} className="text-xs mt-2 block mx-auto opacity-70 hover:opacity-100 transition-opacity">
              Tentar novamente
            </button>
          </div>
        )}

        {apiError === "RATE_LIMIT" && (
          <div className="py-4 max-w-sm">
            <p className="font-serif text-sm mb-1">Limite de requisições atingido</p>
            <p className="text-xs text-[#777b86]">Aguarde alguns minutos e tente novamente.</p>
          </div>
        )}

        {apiError === "ERROR" && (
          <div className="text-center py-16 space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto mb-3 opacity-40" />
            <p className="font-serif text-sm">Não foi possível carregar os versículos.</p>
            {apiDetail && <p className="font-mono text-[10px] text-[#777b86]">{apiDetail}</p>}
            <button onClick={fetchVerses} className="text-xs mt-2 block mx-auto opacity-70 hover:opacity-100 transition-opacity">
              Tentar novamente
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-4 h-4 text-[#777b86] animate-spin" />
          </div>
        )}

        {!loading && !apiError && verses.length > 0 && (
          <div key={animKey} className={direction === "next" ? "page-turn-next" : "page-turn-prev"}>

            <div className="relative text-center mb-10">
              <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden">
                <span className="font-sans font-medium leading-none chapter-watermark tabular-nums"
                  style={{ fontSize: "clamp(7rem, 32vw, 14rem)", color: bookCat ? BOOK_CATEGORIES[bookCat.category].color : "#17191c" }}>
                  {chapter}
                </span>
              </div>
              <h1 className="bible-book-title">{book.name}</h1>
              <p className="bible-chapter-meta">
                <span>{chapter}</span>
                <span className="bible-chapter-track" aria-hidden>
                  <span style={{ transform: `scaleX(${progress})` }} />
                </span>
                <span>{book.chapters}</span>
              </p>
            </div>

            <div className={cn("bible-text", fontSize === "sm" && "bible-text-sm", fontSize === "lg" && "bible-text-lg")}>
              {verses.map((v) => {
                const key     = `${book.id}-${chapter}-${v.number}`
                const hlEntry = highlighted[key]
                const hlCls   = hlEntry ? `hl-${hlEntry.color}` : ""
                return (
                  <span
                    key={v.number}
                    onClick={e => handleVerseClick(e, v.number)}
                    className={cn("bible-verse-row", selectedVerses.has(v.number) && "is-selected")}
                  >
                    {v.heading && (
                      <span className="bible-section-heading">{v.heading}</span>
                    )}
                    <span className="verse-number">
                      {v.endNumber && v.endNumber !== v.number ? `${v.number}–${v.endNumber}` : v.number}
                      {verseNotes[key] && <span className="inline-block w-1 h-1 rounded-full bg-current ml-0.5 opacity-70 align-middle" />}
                    </span>
                    <span className={cn("verse-body", hlCls)}>{v.text}</span>
                  </span>
                )
              })}
            </div>

            <div className="flex justify-center mt-12 mb-2">
              <button onClick={toggleRead} disabled={readSaving}
                className={cn("pill-action", isRead && "pill-action-fill")}>
                <span className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                  isRead ? "border-current bg-current" : "border-current"
                )}>
                  {isRead && <Check className="w-3 h-3 text-[#17191c]" strokeWidth={3} />}
                </span>
                {isRead ? "Capítulo concluído" : "Marcar como lido"}
              </button>
            </div>

            <div className="flex justify-between mt-10">
              <button onClick={() => goChapter(-1)} disabled={isFirstInBible}
                className="flex items-center gap-1.5 text-sm text-[#777b86] hover:text-inherit disabled:opacity-20 transition-colors duration-150">
                <ChevronLeft className="w-4 h-4" />
                {chapter === 1 ? "Livro anterior" : "Capítulo anterior"}
              </button>
              <button onClick={() => goChapter(1)} disabled={isLastInBible}
                className="flex items-center gap-1.5 text-sm text-[#777b86] hover:text-inherit disabled:opacity-20 transition-colors duration-150">
                {chapter === book.chapters ? "Próximo livro" : "Próximo capítulo"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
