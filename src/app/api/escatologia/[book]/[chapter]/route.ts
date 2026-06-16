import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { sanitizePlainText } from "@/lib/sanitize"

type Params = { params: Promise<{ book: string; chapter: string }> }

// Allowlist of prophetic books — keep in sync with PROPHETIC_BOOKS in
// src/app/(app)/escatologia/page.tsx. Prevents storing arbitrary book names
// in the database (poisoning) and locks the API to known references.
const PROPHETIC_BOOKS = new Set([
  "Isaías", "Jeremias", "Ezequiel", "Daniel",
  "Oséias", "Joel", "Amós", "Miquéias", "Zacarias", "Malaquias",
  "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos",
  "1 Coríntios", "1 Tessalonicenses", "2 Tessalonicenses",
  "2 Pedro", "Apocalipse",
])

function parseChapter(raw: string): number | null {
  const n = parseInt(raw, 10)
  return Number.isInteger(n) && n >= 1 && n <= 200 ? n : null
}

const schema = z.object({
  title:                 z.string().max(300).optional(),
  historicalFulfillment: z.string().max(5000).optional().default(""),
  futureProphecy:        z.string().max(5000).optional().default(""),
  tribulationNote:       z.string().max(5000).optional().default(""),
  christReturnNote:      z.string().max(5000).optional().default(""),
  generalNotes:          z.string().max(5000).optional().default(""),
})

function sanitizeNotes<T extends z.infer<typeof schema>>(data: T): T {
  return {
    ...data,
    title:                 data.title ? sanitizePlainText(data.title) : data.title,
    historicalFulfillment: sanitizePlainText(data.historicalFulfillment ?? ""),
    futureProphecy:        sanitizePlainText(data.futureProphecy ?? ""),
    tribulationNote:       sanitizePlainText(data.tribulationNote ?? ""),
    christReturnNote:      sanitizePlainText(data.christReturnNote ?? ""),
    generalNotes:          sanitizePlainText(data.generalNotes ?? ""),
  }
}

export async function GET(_req: Request, { params }: Params) {
  const { book, chapter } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const decodedBook = decodeURIComponent(book)
  const chapterNum  = parseChapter(chapter)
  if (!PROPHETIC_BOOKS.has(decodedBook) || chapterNum === null) {
    return NextResponse.json({ error: "Invalid book or chapter" }, { status: 400 })
  }

  const note = await db.eschatologyNote.findUnique({
    where: { userId_book_chapter: { userId: session.user.id, book: decodedBook, chapter: chapterNum } },
  })

  if (!note) return NextResponse.json(null, { status: 404 })
  return NextResponse.json(note)
}

export async function POST(req: Request, { params }: Params) {
  const { book, chapter } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const decodedBook = decodeURIComponent(book)
  const chapterNum  = parseChapter(chapter)
  if (!PROPHETIC_BOOKS.has(decodedBook) || chapterNum === null) {
    return NextResponse.json({ error: "Invalid book or chapter" }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 })

  const clean = sanitizeNotes(parsed.data)

  const note = await db.eschatologyNote.upsert({
    where: { userId_book_chapter: { userId: session.user.id, book: decodedBook, chapter: chapterNum } },
    create: {
      userId: session.user.id,
      book: decodedBook,
      chapter: chapterNum,
      title: clean.title ?? `${decodedBook} ${chapterNum}`,
      ...clean,
      studiedAt: new Date(),
    },
    update: { ...clean, studiedAt: new Date() },
  })

  return NextResponse.json(note)
}
