"use client"

import Link from "next/link"
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
  const [ready, setReady] = useState(false)

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
      .finally(() => setReady(true))
  }, [])

  if (!ready) return <div className="site-read-block" aria-hidden />

  if (!pos) {
    return (
      <Link href="/biblia?book=JHN&chapter=1&version=nvi" className="site-read-block">
        <p className="site-kicker">Comece aqui</p>
        <h2>João 1</h2>
        <p className="site-read-lede">O Evangelho que apresenta Cristo sem rodeios.</p>
        <span className="text-link">Abrir a Bíblia →</span>
      </Link>
    )
  }

  const bookName = BOOK_ID_NAMES[pos.bookId] ?? pos.bookId
  const totalChaps = BOOK_CHAPTERS[pos.bookId] ?? 1
  const versionLabel = pos.version?.toUpperCase() ?? "NVI"
  const href = `/biblia?book=${pos.bookId}&chapter=${pos.chapter}&version=${pos.version ?? "nvi"}`

  return (
    <Link href={href} className="site-read-block">
      <p className="site-kicker">Onde você parou</p>
      <h2>{bookName}</h2>
      <p className="site-read-lede">
        Capítulo {pos.chapter} de {totalChaps}
        <span> · {versionLabel}</span>
      </p>
      <span className="text-link">Continuar a leitura →</span>
    </Link>
  )
}
