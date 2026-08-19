"use client"

import { Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useBiblePage } from "@/hooks/useBiblePage"
import { BibleControlsBar }    from "@/components/bible/BibleControlsBar"
import { BibleReadingArea }    from "@/components/bible/BibleReadingArea"
import { BibleVerseActionBar } from "@/components/bible/BibleVerseActionBar"
import { BibleVerseNotePanel, BibleChapterNotePanel } from "@/components/bible/BibleNotePanel"
import { BibleComparePanel }   from "@/components/bible/BibleComparePanel"
import { BookModal, ChapterModal } from "@/components/bible/BibleModals"

export default function BibliaPage() {
  const s = useBiblePage()

  return (
    <>
      {/* Reading progress bar */}
      <div className="reading-progress-bar" style={{ width: `${s.scrollProgress * 100}%`, opacity: s.scrollProgress > 0.01 ? 1 : 0 }} />

      {/* Main layout — normal or focus overlay */}
      <div className={cn(s.focusMode ? "fixed inset-0 z-50 bible-focus-overlay overflow-y-auto" : "relative")}>
        {/* Side chapter nav arrows */}
        {!s.loading && !s.apiError && s.verses.length > 0 && !s.isFirstInBible && (
          <button onClick={() => s.goChapter(-1)} className="chapter-side-nav left-0" aria-label="Capítulo anterior">
            <span className="chapter-side-chevron chapter-side-chevron-left" />
          </button>
        )}
        {!s.loading && !s.apiError && s.verses.length > 0 && !s.isLastInBible && (
          <button onClick={() => s.goChapter(1)} className="chapter-side-nav right-0" aria-label="Próximo capítulo">
            <span className="chapter-side-chevron chapter-side-chevron-right" />
          </button>
        )}

        {!s.focusMode && <BibleControlsBar {...s} />}

        <BibleReadingArea {...s} />

        {s.focusMode && (
          <button
            onClick={() => s.setFocusMode(false)}
            title="Sair do modo imersivo (Esc)"
            className="bible-ctrl bible-focus-exit fixed top-4 right-4 z-[60]"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Overlays */}
      <BibleVerseActionBar {...s} />
      <BibleVerseNotePanel {...s} />
      <BibleChapterNotePanel {...s} />
      <BibleComparePanel {...s} />

      {/* Modals */}
      <ChapterModal {...s} />
      <BookModal {...s} />
    </>
  )
}
