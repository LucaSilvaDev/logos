"use client"

import { X, ArrowLeftRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { VERSIONS } from "@/lib/bible-reader"
import { BOOK_ID_NAMES } from "@/lib/reading-plan"
import type { BiblePageState } from "@/hooks/useBiblePage"

type Props = Pick<BiblePageState,
  "book" | "chapter" | "version" | "compareOpen" | "compareVerseNum" |
  "compareData" | "compareLoading" | "setCompareOpen"
>

export function BibleComparePanel({
  book, chapter, version, compareOpen, compareVerseNum,
  compareData, compareLoading, setCompareOpen,
}: Props) {
  if (!compareOpen || compareVerseNum === null) return null
  const bookName = BOOK_ID_NAMES[book.id] ?? book.name

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[200] animate-slide-up"
      style={{
        background: "rgba(14,14,16,0.97)",
        backdropFilter: "blur(48px) saturate(1.8)",
        WebkitBackdropFilter: "blur(48px) saturate(1.8)",
        borderTop: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}>
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#c9a654] opacity-70" />
            <span className="text-[#c9a654] text-[11px] font-serif">
              {bookName} {chapter}:{compareVerseNum} — comparar versões
            </span>
          </div>
          <button onClick={() => setCompareOpen(false)} className="text-[#3d3a55] hover:text-[#55524a] transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        {compareLoading
          ? <div className="flex items-center justify-center py-6"><Loader2 className="w-4 h-4 text-[#3d3a55] animate-spin" /></div>
          : (
            <div className="space-y-3 pb-1">
              {VERSIONS.map(v => (
                <div key={v.id} className="flex gap-3">
                  <span className={cn("text-[10px] font-medium tracking-wider shrink-0 mt-0.5 w-7", version === v.id ? "text-[#c9a654]" : "text-[#3d3a55]")}>
                    {v.label}
                  </span>
                  <p className="font-serif text-[#8a8375] text-sm leading-relaxed flex-1">{compareData[v.id] ?? "—"}</p>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}
