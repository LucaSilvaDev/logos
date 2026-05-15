import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { BOOK_ID_NAMES } from "@/lib/reading-plan"
import { MemorizarClient, type FlashCard } from "./MemorizarClient"
import { Brain } from "lucide-react"

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
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-4 h-4 text-[#c9a654] opacity-60" />
          <h1 className="font-display text-[#e2d9c5] text-base tracking-wide">Memorização</h1>
        </div>
        <p className="text-[#3d3a55] text-[11px] font-sans tracking-wide">
          Versículos grifados com cache disponível — {cards.length} flashcard{cards.length !== 1 ? "s" : ""}
        </p>
      </div>

      <MemorizarClient initialCards={cards} />
    </div>
  )
}
