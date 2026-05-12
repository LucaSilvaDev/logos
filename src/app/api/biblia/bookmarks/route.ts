import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const createSchema = z.object({
  book:    z.string().min(2).max(5),
  chapter: z.number().int().min(1),
  verse:   z.number().int().min(1).optional(),
  version: z.string().min(2).max(10),
  label:   z.string().max(100).optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([])

  const { searchParams } = new URL(req.url)
  const book    = searchParams.get("book") ?? ""
  const chapter = parseInt(searchParams.get("chapter") ?? "0")
  const version = searchParams.get("version") ?? ""

  if (!book || !chapter || !version) return NextResponse.json([])

  const bookmarks = await db.bookmark.findMany({
    where: { userId: session.user.id, book, chapter, version },
    select: { id: true, verse: true, label: true },
  })

  return NextResponse.json(bookmarks)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const { book, chapter, verse, version, label } = parsed.data

  const bookmark = await db.bookmark.create({
    data: {
      userId: session.user.id,
      book,
      chapter,
      verse:  verse ?? null,
      version,
      label:  label ?? null,
    },
  })

  return NextResponse.json(bookmark)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  await db.bookmark.deleteMany({ where: { id, userId: session.user.id } })

  return NextResponse.json({ ok: true })
}
