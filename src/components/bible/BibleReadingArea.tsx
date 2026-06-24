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
      <div className="max-w-2xl mx-auto px-8 py-12">

        {apiError === "AUTH_REQUIRED" && (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="w-6 h-6 text-[#c9a654] opacity-40 mx-auto" />
            <p className="font-serif text-[#c9c0a8] text-base">Chave de API não configurada</p>
            <p className="text-[#55524a] text-sm leading-relaxed max-w-sm mx-auto">
              Verifique as variáveis de ambiente no servidor.
            </p>
          </div>
        )}

        {apiError === "NOT_LICENSED" && (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="w-6 h-6 text-[#c9a654] opacity-40 mx-auto" />
            <p className="font-serif text-[#c9c0a8] text-base">Versão não disponível para este livro</p>
            <p className="text-[#55524a] text-sm leading-relaxed max-w-sm mx-auto">
              A licença desta versão não cobre este livro. Aceite a licença completa em{" "}
              <span className="text-[#8a8375] font-mono text-xs">platform.youversion.com</span>
            </p>
            <button onClick={fetchVerses} className="text-xs text-[#c9a654] hover:opacity-80 transition-opacity mt-2 block mx-auto">
              Tentar novamente
            </button>
          </div>
        )}

        {apiError === "RATE_LIMIT" && (
          <div className="relative pl-6 py-4 max-w-sm">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#c9a654] opacity-40" />
            <p className="font-serif text-[#c9a654] text-sm mb-1">Limite de requisições atingido</p>
            <p className="text-[#55524a] text-xs">Aguarde alguns minutos e tente novamente.</p>
          </div>
        )}

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

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-4 h-4 text-[#3d3a55] animate-spin" />
          </div>
        )}

        {!loading && !apiError && verses.length > 0 && (
          <div key={animKey} className={direction === "next" ? "page-turn-next" : "page-turn-prev"}>

            {/* Chapter heading */}
            <div className="text-center mb-12 relative">
              <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden">
                <span className="font-display font-bold leading-none chapter-watermark"
                  style={{ fontSize: "clamp(7rem, 35vw, 16rem)", color: bookCat ? BOOK_CATEGORIES[bookCat.category].color : "#c9a654" }}>
                  {chapter}
                </span>
              </div>
              <h1 className="chapter-heading text-base mb-1">{book.name}</h1>
              <p className="font-sans text-[9px] text-[#3d3a55] tracking-[0.25em] uppercase">Capítulo {chapter}</p>
              <div className="w-12 h-px mx-auto mt-4" style={{ background: bookCat ? BOOK_CATEGORIES[bookCat.category].color : "#c9a654", opacity: 0.4 }} />
              <div className="flex items-center justify-center gap-2.5 mt-3">
                <span className="text-[9px] text-[#3d3a55] font-mono tabular-nums">{chapter}</span>
                <div className="w-20 h-px bg-[#2e2b42] relative overflow-hidden rounded-full">
                  <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((chapter / book.chapters) * 100)}%`, background: bookCat ? BOOK_CATEGORIES[bookCat.category].color : "#c9a654", opacity: 0.5 }} />
                </div>
                <span className="text-[9px] text-[#3d3a55] font-mono tabular-nums">{book.chapters}</span>
              </div>
            </div>

            {/* Verses */}
            <div className={cn("bible-text", fontSize === "sm" && "bible-text-sm", fontSize === "lg" && "bible-text-lg")}>
              {verses.map((v, index) => {
                const key     = `${book.id}-${chapter}-${v.number}`
                const hlEntry = highlighted[key]
                const hlCls   = hlEntry ? `hl-${hlEntry.color}` : ""
                const delay   = Math.min(index, 15) * 30
                return (
                  <span key={v.number} className="bible-verse-row">
                    {v.heading && (
                      <span className="verse-enter bible-section-heading" style={{ animationDelay: `${delay}ms` }}>
                        {v.heading}
                      </span>
                    )}
                    <span
                      onClick={e => handleVerseClick(e, v.number)}
                      style={{ animationDelay: `${delay}ms` }}
                      className={cn(
                        "verse-enter cursor-pointer transition-colors duration-300 rounded-sm", hlCls,
                        selectedVerses.has(v.number)
                          ? "bg-[#c9a65418] underline decoration-[#c9a654]/35 decoration-1 underline-offset-2"
                          : !hlEntry && "hover:bg-[#c9a65408]"
                      )}>
                      <sup className="verse-number">
                        {v.endNumber && v.endNumber !== v.number ? `${v.number}–${v.endNumber}` : v.number}
                        {verseNotes[key] && <span className="inline-block w-1 h-1 rounded-full bg-[#c9a654] ml-0.5 opacity-70 translate-y-[-1px]" />}
                      </sup>
                      {v.text}
                    </span>
                  </span>
                )
              })}
            </div>

            {/* Mark as read */}
            <div className="flex justify-center mt-12 mb-2">
              <button onClick={toggleRead} disabled={readSaving}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-serif transition-all duration-300",
                  isRead
                    ? "bg-[#c9a654]/12 text-[#c9a654] border border-[#c9a654]/30 hover:bg-[#c9a654]/8"
                    : "bg-[#1e1c28] text-[#6b6860] border border-[#2e2b42]/60 hover:text-[#c9a654] hover:border-[#c9a654]/25"
                )}>
                <span className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0",
                  isRead ? "bg-[#c9a654] border-[#c9a654]" : "border-[#3d3a55]"
                )}>
                  {isRead && <Check className="w-3 h-3 text-[#0e0d14]" strokeWidth={3} />}
                </span>
                {isRead ? "Capítulo concluído" : "Marcar como lido"}
              </button>
            </div>

            {/* Chapter navigation footer */}
            <div className="flex justify-between mt-8 pt-6 border-t border-[#2e2b42]/40">
              <button onClick={() => goChapter(-1)} disabled={isFirstInBible}
                className="flex items-center gap-1.5 text-sm font-serif text-[#55524a] hover:text-[#c9a654] disabled:opacity-20 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                {chapter === 1 ? "Livro anterior" : "Capítulo anterior"}
              </button>
              <button onClick={() => goChapter(1)} disabled={isLastInBible}
                className="flex items-center gap-1.5 text-sm font-serif text-[#55524a] hover:text-[#c9a654] disabled:opacity-20 transition-colors">
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
