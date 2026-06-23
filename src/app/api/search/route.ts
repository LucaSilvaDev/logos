import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { BOOK_ID_NAMES } from "@/lib/reading-plan"

export interface SearchResult {
  id:      string
  type:    "verse" | "devocional" | "estudo" | "oracao"
  title:   string
  excerpt: string
  url:     string
  meta?:   string
}

function excerpt(text: string, query: string, maxLen = 120): string {
  const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  const idx = plain.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return plain.slice(0, maxLen) + (plain.length > maxLen ? "…" : "")
  const start = Math.max(0, idx - 40)
  const end   = Math.min(plain.length, idx + query.length + 80)
  return (start > 0 ? "…" : "") + plain.slice(start, end) + (end < plain.length ? "…" : "")
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const userId = session.user.id
  const results: SearchResult[] = []

  const [devotionals, studyNotes, prayers, verses] = await Promise.all([
    db.devotional.findMany({
      where: {
        userId,
        OR: [
          { title:   { contains: q } },
          { content: { contains: q } },
          { bibleRef: { contains: q } },
        ],
      },
      orderBy: { date: "desc" },
      take: 10,
      select: { id: true, title: true, content: true, date: true, bibleRef: true },
    }),

    db.studyNote.findMany({
      where: {
        userId,
        OR: [
          { title:   { contains: q } },
          { content: { contains: q } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, title: true, content: true, book: true, chapter: true },
    }),

    db.prayer.findMany({
      where: {
        userId,
        OR: [
          { title:   { contains: q } },
          { content: { contains: q } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, content: true, category: true, answered: true },
    }),

    db.bibleVerse.findMany({
      where: { text: { contains: q } },
      orderBy: [{ book: "asc" }, { chapter: "asc" }, { verse: "asc" }],
      take: 20,
      select: { id: true, book: true, chapter: true, verse: true, version: true, text: true },
    }),
  ])

  for (const d of devotionals) {
    results.push({
      id:      d.id,
      type:    "devocional",
      title:   d.title,
      excerpt: excerpt(d.content, q),
      url:     `/devocional/${d.id}`,
      meta:    d.bibleRef ?? undefined,
    })
  }

  for (const s of studyNotes) {
    const bookName = BOOK_ID_NAMES[s.book] ?? s.book
    results.push({
      id:      s.id,
      type:    "estudo",
      title:   s.title,
      excerpt: excerpt(s.content, q),
      url:     `/estudo/${s.id}`,
      meta:    s.chapter ? `${bookName} ${s.chapter}` : bookName,
    })
  }

  for (const p of prayers) {
    results.push({
      id:      p.id,
      type:    "oracao",
      title:   p.title,
      excerpt: excerpt(p.content, q),
      url:     `/oracoes`,
      meta:    p.answered ? "Respondida" : undefined,
    })
  }

  for (const v of verses) {
    const bookName = BOOK_ID_NAMES[v.book] ?? v.book
    results.push({
      id:      v.id,
      type:    "verse",
      title:   `${bookName} ${v.chapter}:${v.verse}`,
      excerpt: excerpt(v.text, q),
      url:     `/biblia?book=${v.book}&chapter=${v.chapter}&version=${v.version}`,
      meta:    v.version.toUpperCase(),
    })
  }

  return NextResponse.json(results)
}
