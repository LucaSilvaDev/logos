import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// GET /api/biblia/read?book=GEN  → list of read chapters for that book
// GET /api/biblia/read            → all read chapters { book, chapter }[]
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([])

  const { searchParams } = new URL(req.url)
  const book = searchParams.get("book")

  const reads = await db.chapterRead.findMany({
    where: { userId: session.user.id, ...(book ? { book } : {}) },
    select: { book: true, chapter: true, readAt: true },
    orderBy: { readAt: "desc" },
  })

  return NextResponse.json(reads)
}

// POST /api/biblia/read { book, chapter } → mark as read (upsert)
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { book, chapter } = await req.json()
  if (!book || !chapter) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  await db.chapterRead.upsert({
    where:  { userId_book_chapter: { userId: session.user.id, book, chapter } },
    update: { readAt: new Date() },
    create: { userId: session.user.id, book, chapter },
  })

  return NextResponse.json({ ok: true })
}

// DELETE /api/biblia/read { book, chapter } → unmark
export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { book, chapter } = await req.json()
  if (!book || !chapter) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  await db.chapterRead.deleteMany({
    where: { userId: session.user.id, book, chapter },
  })

  return NextResponse.json({ ok: true })
}
