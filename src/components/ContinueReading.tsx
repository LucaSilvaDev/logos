"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { BOOK_ID_NAMES, BOOK_CHAPTERS } from "@/lib/reading-plan"
import { useEffect, useState } from "react"

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
    setPos(readLocalPos())
    fetch("/api/biblia/last-read")
      .then(r => r.ok ? r.json() : null)
      .then((data: SavedPos | null) => {
        if (data?.bookId && data?.chapter) {
          setPos(data)
          localStorage.setItem("selah-bible-pos", JSON.stringify(data))
        }
      })
      .catch(() => {})
  }, [])

  if (!pos) return null

  const bookName    = BOOK_ID_NAMES[pos.bookId] ?? pos.bookId
  const totalChaps  = BOOK_CHAPTERS[pos.bookId] ?? 1
  const progress    = Math.min(1, pos.chapter / totalChaps)
  const versionLabel = pos.version?.toUpperCase() ?? "NVI"
  const href = `/biblia?book=${pos.bookId}&chapter=${pos.chapter}&version=${pos.version ?? "nvi"}`

  return (
    <Link href={href} className="artifact-card group animate-fade-up delay-140">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="font-serif text-[26px] leading-none tracking-tight">{bookName}</p>
          <p className="mt-2 text-[15px] text-[#777b86]">
            Capítulo {pos.chapter} de {totalChaps}
            <span className="ml-2 text-[14px] text-[#979799]">{versionLabel}</span>
          </p>
        </div>
        <ChevronRight className="w-4 h-4 mt-1 opacity-30 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="flex items-end justify-between gap-4 mb-4">
        <p className="text-[15px] text-[#777b86]">Continue onde parou</p>
        <p className="text-[20px] font-medium tabular-nums">{Math.round(progress * 100)}%</p>
      </div>
      <div className="track">
        <span style={{ width: `${progress * 100}%` }} />
      </div>
    </Link>
  )
}
