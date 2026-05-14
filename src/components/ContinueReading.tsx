"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { BOOK_ID_NAMES } from "@/lib/reading-plan"

interface SavedPos {
  bookId: string
  chapter: number
  version: string
}

export function ContinueReading() {
  const [pos, setPos] = useState<SavedPos | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("selah-bible-pos")
      if (!raw) return
      const p = JSON.parse(raw)
      if (p?.bookId && p?.chapter) setPos(p)
    } catch { /* ignore */ }
  }, [])

  if (!pos) return null

  const bookName = BOOK_ID_NAMES[pos.bookId] ?? pos.bookId
  const versionLabel = pos.version?.toUpperCase() ?? "NVI"
  const href = `/biblia?book=${pos.bookId}&chapter=${pos.chapter}&version=${pos.version ?? "nvi"}`

  return (
    <Link
      href={href}
      className="candle-enter candle-delay-3 block card-soft relative pl-6 pr-4 py-4 group"
      style={{ animationDelay: "560ms" }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#c9a654] via-[#c9a654] to-transparent opacity-40 rounded-full" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-3.5 h-3.5 text-[#4a3826] group-hover:text-[#c9a654] transition-colors shrink-0" />
          <div>
            <p className="font-display text-[9px] text-[#c9a654] uppercase tracking-[0.2em] opacity-70 mb-0.5">
              Continue onde parou
            </p>
            <p className="text-[#8a8375] text-sm group-hover:text-[#c9c0a8] transition-colors">
              {bookName} {pos.chapter}
              <span className="ml-2 text-[10px] text-[#4a3826] font-display uppercase tracking-wider">{versionLabel}</span>
            </p>
          </div>
        </div>
        <span className="text-[#4a3826] group-hover:text-[#c9a654] transition-colors text-xs">→</span>
      </div>
    </Link>
  )
}
