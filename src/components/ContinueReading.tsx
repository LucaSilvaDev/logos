"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, ChevronRight } from "lucide-react"
import { BOOK_ID_NAMES, BOOK_CHAPTERS } from "@/lib/reading-plan"

interface SavedPos {
  bookId: string
  chapter: number
  version: string
}

function readLocalPos(): SavedPos | null {
  try {
    const raw = localStorage.getItem("selah-bible-pos")
    if (!raw) return null
    const p = JSON.parse(raw)
    if (p?.bookId && p?.chapter) return p
  } catch { /* ignore */ }
  return null
}

export function ContinueReading() {
  const [pos, setPos] = useState<SavedPos | null>(null)

  useEffect(() => {
    // Show localStorage immediately to avoid flicker
    setPos(readLocalPos())

    // Then sync with server (authoritative across devices)
    fetch("/api/biblia/last-read")
      .then(r => r.ok ? r.json() : null)
      .then((data: SavedPos | null) => {
        if (data?.bookId && data?.chapter) {
          setPos(data)
          localStorage.setItem("selah-bible-pos", JSON.stringify(data))
        }
      })
      .catch(() => { /* keep localStorage value */ })
  }, [])

  if (!pos) return null

  const bookName    = BOOK_ID_NAMES[pos.bookId] ?? pos.bookId
  const totalChaps  = BOOK_CHAPTERS[pos.bookId] ?? 1
  const progress    = Math.min(1, pos.chapter / totalChaps)
  const versionLabel = pos.version?.toUpperCase() ?? "NVI"
  const href = `/biblia?book=${pos.bookId}&chapter=${pos.chapter}&version=${pos.version ?? "nvi"}`

  return (
    <Link
      href={href}
      className="candle-enter candle-delay-3 flame-hover block card-soft relative px-5 py-4 group overflow-hidden"
      style={{ animationDelay: "560ms" }}
    >
      {/* Subtle gold shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "linear-gradient(105deg, rgba(201,166,84,0.04) 0%, transparent 60%)" }} />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-[#c9a654] opacity-60 shrink-0" />
          <p className="font-display text-[9px] text-[#c9a654] uppercase tracking-[0.2em] opacity-70">
            Continue onde parou
          </p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-[#3d3a55] group-hover:text-[#c9a654] group-hover:translate-x-0.5 transition-all duration-200" />
      </div>

      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <p className="font-serif text-[#c9c0a8] text-base group-hover:text-[#e2d9c5] transition-colors leading-tight">
            {bookName}
          </p>
          <p className="text-[#55524a] text-[11px] mt-0.5">
            Capítulo {pos.chapter}
            <span className="text-[#3d3a55] ml-1.5">de {totalChaps}</span>
            <span className="ml-2 text-[10px] font-display tracking-wider opacity-60">{versionLabel}</span>
          </p>
        </div>
        <p className="text-[#3d3a55] text-[10px] font-sans tabular-nums shrink-0 mb-0.5">
          {Math.round(progress * 100)}%
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #c9a654, #e8c87a)",
          }}
        />
      </div>
    </Link>
  )
}
