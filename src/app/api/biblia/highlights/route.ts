import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const createSchema = z.object({
  book:       z.string().min(2).max(5),
  chapter:    z.number().int().min(1),
  verseStart: z.number().int().min(1),
  verseEnd:   z.number().int().min(1),
  version:    z.string().min(2).max(10),
  color:      z.enum(["yellow", "green", "blue", "red"]),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 200 })

  const { searchParams } = new URL(req.url)
  const book    = searchParams.get("book") ?? ""
  const chapter = parseInt(searchParams.get("chapter") ?? "0")
  const version = searchParams.get("version") ?? ""

  if (!book || !chapter || !version) return NextResponse.json([])

  const highlights = await db.highlight.findMany({
    where: { userId: session.user.id, book, chapter, version },
    select: { id: true, verseStart: true, verseEnd: true, color: true },
  })

  return NextResponse.json(highlights)
}

const MAX_HIGHLIGHTS_PER_USER = 5000

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const total = await db.highlight.count({ where: { userId: session.user.id } })
  if (total >= MAX_HIGHLIGHTS_PER_USER) {
    return NextResponse.json({ error: "Limite de destaques atingido" }, { status: 429 })
  }

  const { book, chapter, verseStart, verseEnd, version, color } = parsed.data

  // Remove any overlapping highlight for the same verses
  await db.highlight.deleteMany({
    where: {
      userId: session.user.id,
      book,
      chapter,
      version,
      verseStart: { lte: verseEnd },
      verseEnd:   { gte: verseStart },
    },
  })

  const highlight = await db.highlight.create({
    data: { userId: session.user.id, book, chapter, verseStart, verseEnd, version, color },
  })

  return NextResponse.json(highlight)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  await db.highlight.deleteMany({ where: { id, userId: session.user.id } })

  return NextResponse.json({ ok: true })
}
