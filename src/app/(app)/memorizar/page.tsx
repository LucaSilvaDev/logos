import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { BOOK_ID_NAMES } from "@/lib/reading-plan"
import { MemorizarClient, type FlashCard } from "./MemorizarClient"

export const metadata = { title: "Memorizar — Selah" }

export default async function MemorizarPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/entrar")
  const userId = session.user.id

  const highlights = await db.highlight.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  const cards: FlashCard[] = []

  if (highlights.length > 0) {
    // Bulk-fetch cached verses for all highlight locations
    const combos = [
      ...new Map(
        highlights.map(h => [`${h.book}|${h.chapter}|${h.version}`, { book: h.book, chapter: h.chapter, version: h.version }])
      ).values(),
    ]

    const cached = await db.bibleVerse.findMany({
      where: {
        OR: combos.map(c => ({ book: c.book, chapter: c.chapter, version: c.version })),
      },
    })

    const verseMap = new Map(
      cached.map(v => [`${v.book}|${v.chapter}|${v.verse}|${v.version}`, v.text])
    )

    for (const hl of highlights) {
      for (let v = hl.verseStart; v <= hl.verseEnd; v++) {
        const text = verseMap.get(`${hl.book}|${hl.chapter}|${v}|${hl.version}`)
        if (!text) continue
        const bookName = BOOK_ID_NAMES[hl.book] ?? hl.book
        cards.push({
          id:    `${hl.id}-${v}`,
          ref:   `${bookName} ${hl.chapter}:${v}`,
          text,
          color: hl.color,
        })
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="page-title">Memorizar</h1>
        <p className="page-desc">
          {cards.length} flashcard{cards.length !== 1 ? "s" : ""} a partir dos seus grifos
        </p>
      </div>

      <MemorizarClient initialCards={cards} />
    </div>
  )
}
