import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

type Params = { params: Promise<{ book: string; chapter: string }> }

const schema = z.object({
  title:                z.string().max(300).optional(),
  historicalFulfillment: z.string().max(5000).optional().default(""),
  futureProphecy:       z.string().max(5000).optional().default(""),
  tribulationNote:      z.string().max(5000).optional().default(""),
  christReturnNote:     z.string().max(5000).optional().default(""),
  generalNotes:         z.string().max(5000).optional().default(""),
})

export async function GET(_req: Request, { params }: Params) {
  const { book, chapter } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const note = await db.eschatologyNote.findUnique({
    where: { userId_book_chapter: { userId: session.user.id, book: decodeURIComponent(book), chapter: parseInt(chapter) } },
  })

  if (!note) return NextResponse.json(null, { status: 404 })
  return NextResponse.json(note)
}

export async function POST(req: Request, { params }: Params) {
  const { book, chapter } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 })

  const decodedBook = decodeURIComponent(book)
  const chapterNum = parseInt(chapter)

  const note = await db.eschatologyNote.upsert({
    where: { userId_book_chapter: { userId: session.user.id, book: decodedBook, chapter: chapterNum } },
    create: {
      userId: session.user.id,
      book: decodedBook,
      chapter: chapterNum,
      title: parsed.data.title ?? `${decodedBook} ${chapterNum}`,
      ...parsed.data,
      studiedAt: new Date(),
    },
    update: { ...parsed.data, studiedAt: new Date() },
  })

  return NextResponse.json(note)
}
