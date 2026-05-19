import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const createSchema = z.object({
  book:    z.string().min(2).max(5),
  chapter: z.number().int().min(1),
  verse:   z.number().int().min(0),
  version: z.string().min(2).max(10),
  text:    z.string().min(1).max(5000),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 200 })

  const { searchParams } = new URL(req.url)
  const book    = searchParams.get("book") ?? ""
  const chapter = parseInt(searchParams.get("chapter") ?? "0")
  const version = searchParams.get("version") ?? ""

  if (!book || !chapter || !version) return NextResponse.json([])

  const notes = await db.verseNote.findMany({
    where: { userId: session.user.id, book, chapter, version },
    select: { id: true, verse: true, text: true },
  })

  return NextResponse.json(notes)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const { book, chapter, verse, version, text } = parsed.data

  const note = await db.verseNote.upsert({
    where: {
      userId_book_chapter_verse_version: {
        userId: session.user.id, book, chapter, verse, version,
      },
    },
    update:  { text },
    create:  { userId: session.user.id, book, chapter, verse, version, text },
  })

  return NextResponse.json(note)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  await db.verseNote.deleteMany({ where: { id, userId: session.user.id } })

  return NextResponse.json({ ok: true })
}
