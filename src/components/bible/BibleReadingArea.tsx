"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BiblePageState } from "@/hooks/useBiblePage"

type Props = Pick<BiblePageState,
  "book" | "chapter" | "version" | "fontSize" | "verses" | "loading" | "refreshing" |
  "apiError" | "apiDetail" | "direction" | "animKey" | "highlighted" |
  "verseNotes" | "selectedVerses" | "readChapters" | "readSaving" |
  "isFirstInBible" | "isLastInBible" |
  "fetchVerses" | "goChapter" | "handleVerseClick" | "toggleRead"
>

function ReadHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(localStorage.getItem("selah-bible-hint") !== "1")
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  return (
    <p className="bible-read-hint">
      Toque um versículo para grifar, anotar ou comparar.
    </p>
  )
}

function rubberband(overshoot: number, dimension = 280, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

export function BibleReadingArea({
  book, chapter, fontSize, verses, loading, refreshing, apiError, apiDetail,
  direction, animKey, highlighted, verseNotes, selectedVerses,
  readChapters, readSaving, isFirstInBible, isLastInBible,
  fetchVerses, goChapter, handleVerseClick, toggleRead,
}: Props) {
  const isRead  = readChapters.has(`${book.id}-${chapter}`)
  const progress = Math.max(0.04, chapter / book.chapters)
  const paneRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ x: 0, y: 0, dx: 0, axis: null as "h" | "v" | null, pointer: -1, dragged: false })

  function paneX(x: number, withTransition: boolean) {
    const el = paneRef.current
    if (!el) return
    el.style.transition = withTransition
      ? "transform 280ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)"
      : "none"
    el.style.transform = x ? `translateX(${x}px)` : ""
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return
    if ((e.target as HTMLElement).closest("button, a")) return
    drag.current = { x: e.clientX, y: e.clientY, dx: 0, axis: null, pointer: e.pointerId, dragged: false }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (drag.current.pointer !== e.pointerId) return
    const mx = e.clientX - drag.current.x
    const my = e.clientY - drag.current.y
    if (!drag.current.axis) {
      if (Math.abs(mx) < 10 && Math.abs(my) < 10) return
      drag.current.axis = Math.abs(mx) > Math.abs(my) * 1.2 ? "h" : "v"
      if (drag.current.axis === "h") {
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      }
    }
    if (drag.current.axis !== "h") return
    e.preventDefault()
    drag.current.dragged = true
    let x = mx
    if ((mx > 0 && isFirstInBible) || (mx < 0 && isLastInBible)) x = rubberband(mx)
    drag.current.dx = x
    paneX(x, false)
  }

  function onPointerUp(e: React.PointerEvent) {
    if (drag.current.pointer !== e.pointerId) return
    const dx = drag.current.dx
    const dragged = drag.current.dragged
    drag.current.pointer = -1
    drag.current.axis = null
    if (!dragged) return
    if (dx < -64 && !isLastInBible) {
      paneX(-120, true)
      goChapter(1)
    } else if (dx > 64 && !isFirstInBible) {
      paneX(120, true)
      goChapter(-1)
    } else {
      paneX(0, true)
    }
  }

  return (
    <div
      className="bible-swipe overflow-x-hidden"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="bible-stage max-w-2xl mx-auto px-6 sm:px-8 py-8 sm:py-12">

        {apiError && verses.length === 0 && apiError === "AUTH_REQUIRED" && (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="w-6 h-6 text-[#979799] mx-auto" />
            <p className="font-serif text-base">Chave de API não configurada</p>
            <p className="text-sm leading-relaxed max-w-sm mx-auto text-[#777b86]">
              Verifique as variáveis de ambiente no servidor.
            </p>
          </div>
        )}

        {apiError && verses.length === 0 && apiError === "NOT_LICENSED" && (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="w-6 h-6 text-[#979799] mx-auto" />
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

        {apiError && verses.length === 0 && apiError === "RATE_LIMIT" && (
          <div className="py-4 max-w-sm">
            <p className="font-serif text-sm mb-1">Limite de requisições atingido</p>
            <p className="text-xs text-[#777b86]">Aguarde alguns minutos e tente novamente.</p>
          </div>
        )}

        {apiError && verses.length === 0 && apiError === "ERROR" && (
          <div className="text-center py-16 space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto mb-3 opacity-40" />
            <p className="font-serif text-sm">Não foi possível carregar os versículos.</p>
            {apiDetail && <p className="font-mono text-[10px] text-[#777b86]">{apiDetail}</p>}
            <button onClick={fetchVerses} className="text-xs mt-2 block mx-auto opacity-70 hover:opacity-100 transition-opacity">
              Tentar novamente
            </button>
          </div>
        )}

        {loading && verses.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-4 h-4 text-[#777b86] animate-spin" />
          </div>
        )}

        {apiError && verses.length > 0 && (
          <p className="text-center text-sm text-[#777b86] mb-6">
            Não foi possível carregar este capítulo.{" "}
            <button onClick={fetchVerses} className="underline-offset-2 hover:underline">Tentar de novo</button>
          </p>
        )}

        {verses.length > 0 && (
          <>
            <div
              key={`wm-${chapter}`}
              className={cn("bible-watermark-layer", direction === "next" ? "wm-next" : "wm-prev")}
              aria-hidden
            >
              <span
                className="chapter-watermark font-sans font-medium leading-none tabular-nums"
                style={{ fontSize: "clamp(7rem, 32vw, 14rem)", color: "#17191c" }}
              >
                {chapter}
              </span>
            </div>

            <div
              ref={paneRef}
              key={animKey}
              className={cn(
                direction === "next" ? "page-turn-next" : "page-turn-prev",
                refreshing && "is-refreshing"
              )}
            >
              <div className="relative text-center mb-10">
                <h1 className="bible-book-title">{book.name}</h1>
                <ReadHint />
                <p className="bible-chapter-meta">
                  <span className="bible-chapter-now" data-dir={direction}>
                    <span key={chapter}>{chapter}</span>
                  </span>
                  <span className="bible-chapter-track" aria-hidden>
                    <span style={{ transform: `scaleX(${progress})` }} />
                  </span>
                  <span>{book.chapters}</span>
                </p>
              </div>

              <div className={cn("bible-text", fontSize === "sm" && "bible-text-sm", fontSize === "lg" && "bible-text-lg")}>
                {verses.map((v, index) => {
                  const key     = `${book.id}-${chapter}-${v.number}`
                  const hlEntry = highlighted[key]
                  const hlCls   = hlEntry ? `hl-${hlEntry.color}` : ""
                  return (
                    <span
                      key={v.number}
                      onClick={e => {
                        if (drag.current.dragged) return
                        try { localStorage.setItem("selah-bible-hint", "1") } catch { /* ignore */ }
                        handleVerseClick(e, v.number)
                      }}
                      style={{ "--verse-i": Math.min(index, 6) } as React.CSSProperties}
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
                    "bible-read-mark",
                    isRead && "is-on"
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
          </>
        )}
      </div>
    </div>
  )
}
