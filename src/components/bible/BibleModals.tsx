"use client"

import { X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { BOOK_CATEGORIES, AT_GROUPS, NT_GROUPS, getBookCategory } from "@/lib/bible-categories"
import { BOOK_MAP } from "@/lib/bible-reader"
import type { BiblePageState } from "@/hooks/useBiblePage"

// ── Chapter picker ────────────────────────────────────────────────────────────

type ChapterModalProps = Pick<BiblePageState,
  "book" | "chapter" | "readChapters" | "showChapterModal" | "chapterCols" |
  "setChapter" | "setShowChapterModal" | "setDirection" | "setAnimKey"
>

export function ChapterModal({
  book, chapter, readChapters, showChapterModal, chapterCols,
  setChapter, setShowChapterModal, setDirection, setAnimKey,
}: ChapterModalProps) {
  if (!showChapterModal) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowChapterModal(false)} />
      <div className="relative z-10 w-full max-w-sm overflow-hidden flex flex-col modal-enter"
        style={{
          background: "rgba(14, 14, 16, 0.88)",
          backdropFilter: "blur(48px) saturate(1.6)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)",
          borderRadius: "24px",
          maxHeight: "calc(100vh - 120px)",
        }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="font-display text-[9px] text-[#c9a654] uppercase tracking-[0.25em] opacity-70">Capítulo</p>
            <p className="font-serif text-[#c9c0a8] text-sm mt-0.5">{book.name}</p>
          </div>
          <button onClick={() => setShowChapterModal(false)} className="text-[#3d3a55] hover:text-[#8a8375] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-4 pb-5">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${chapterCols}, minmax(0, 1fr))` }}>
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map(n => {
              const isChRead = readChapters.has(`${book.id}-${n}`)
              return (
                <button key={n}
                  onClick={() => { setDirection(n > chapter ? "next" : "prev"); setAnimKey(k => k + 1); setChapter(n); setShowChapterModal(false) }}
                  className={cn(
                    "relative py-2 text-xs font-serif rounded-xl transition-all duration-200",
                    n === chapter ? "bg-[#c9a65420] text-[#c9a654]"
                      : isChRead ? "text-[#c9a654]/60 hover:text-[#c9a654] hover:bg-[#c9a65410]"
                      : "text-[#55524a] hover:text-[#c9c0a8] hover:bg-[#ffffff08]"
                  )}>
                  {n}
                  {isChRead && n !== chapter && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#c9a654]/50" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Book selector ─────────────────────────────────────────────────────────────

type BookModalProps = Pick<BiblePageState,
  "book" | "tab" | "filter" | "filteredBooks" | "showBookModal" |
  "setTab" | "setFilter" | "setShowBookModal" | "changeBook"
>

export function BookModal({
  book, tab, filter, filteredBooks, showBookModal,
  setTab, setFilter, setShowBookModal, changeBook,
}: BookModalProps) {
  if (!showBookModal) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBookModal(false)} />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden flex flex-col modal-enter"
        style={{
          background: "rgba(14, 14, 16, 0.88)",
          backdropFilter: "blur(48px) saturate(1.6)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)",
          borderRadius: "24px",
          maxHeight: "calc(100vh - 96px)",
        }}>

        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex gap-2">
            {(["AT", "NT"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn(
                  "font-sans text-[10px] uppercase tracking-[0.2em] transition-all duration-200 px-3 py-1.5 rounded-full border",
                  tab === t
                    ? "bg-[#c9a65420] text-[#c9a654] border-[#c9a65440]"
                    : "text-[#3d3a55] border-[#ffffff08] hover:text-[#55524a]"
                )}>
                {t === "AT" ? "Antigo Testamento" : "Novo Testamento"}
              </button>
            ))}
          </div>
          <button onClick={() => setShowBookModal(false)} className="text-[#3d3a55] hover:text-[#8a8375] transition-colors duration-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3d3a55]" />
            <input
              value={filter} onChange={e => setFilter(e.target.value)}
              placeholder="Buscar livro..." autoFocus
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl text-[#8a8375] placeholder:text-[#3d3a55] outline-none font-serif transition-colors duration-200"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              onFocus={e => (e.target.style.borderColor = "rgba(201,166,84,0.4)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
            />
          </div>
        </div>

        <div className="overflow-y-auto p-4 pt-2">
          {filter.trim() ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
              {filteredBooks.map(b => {
                const cat = getBookCategory(b.id)
                return (
                  <button key={b.id}
                    onClick={() => { changeBook(b); setShowBookModal(false); setFilter("") }}
                    className={cn(
                      "px-3 py-2.5 text-left text-sm font-serif rounded-xl transition-all duration-200 border-l-2",
                      book.id === b.id ? "text-[#c9a654] bg-[#c9a65418]" : "text-[#55524a] hover:text-[#c9c0a8] hover:bg-[#ffffff06]"
                    )}
                    style={{ borderLeftColor: cat ? BOOK_CATEGORIES[cat.category].color : "transparent" }}>
                    {b.name}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-5">
              {(tab === "AT" ? AT_GROUPS : NT_GROUPS).map(group => {
                const groupBooks = group.ids.map(id => BOOK_MAP[id]).filter(Boolean)
                const cat = BOOK_CATEGORIES[group.category]
                return (
                  <div key={group.category}>
                    <div className="flex items-center gap-2 px-1 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="font-display text-[8px] uppercase tracking-[0.28em]" style={{ color: cat.color, opacity: 0.85 }}>{cat.label}</span>
                      <div className="flex-1 h-px" style={{ background: cat.color, opacity: 0.12 }} />
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                      {groupBooks.map(b => (
                        <button key={b.id}
                          onClick={() => { changeBook(b); setShowBookModal(false); setFilter("") }}
                          className={cn(
                            "px-3 py-2.5 text-left text-sm font-serif rounded-xl transition-all duration-200 border-l-2",
                            book.id === b.id ? "text-[#c9c0a8] bg-[#ffffff08]" : "text-[#55524a] hover:text-[#c9c0a8] hover:bg-[#ffffff06]"
                          )}
                          style={{ borderLeftColor: book.id === b.id ? cat.color : "transparent" }}>
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
