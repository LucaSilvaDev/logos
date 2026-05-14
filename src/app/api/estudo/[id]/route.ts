import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { sanitizeRichText, sanitizePlainText } from "@/lib/sanitize"

const schema = z.object({
  title:   z.string().min(1).max(300).optional(),
  content: z.string().min(1).optional(),
  book:    z.string().min(1).max(100).optional(),
  chapter: z.number().int().positive().nullable().optional(),
  verse:   z.number().int().positive().nullable().optional(),
  type:    z.enum(["exegesis","theology","application","word_study","cross_ref"]).optional(),
  tags:    z.string().max(500).optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const note = await db.studyNote.findFirst({ where: { id, userId: session.user.id } })
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(note)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 })

  const data = { ...parsed.data }
  if (typeof data.content === "string") data.content = sanitizeRichText(data.content)
  if (typeof data.title === "string")   data.title   = sanitizePlainText(data.title)
  if (typeof data.book === "string")    data.book    = sanitizePlainText(data.book)
  if (typeof data.tags === "string")    data.tags    = sanitizePlainText(data.tags)

  await db.studyNote.updateMany({ where: { id, userId: session.user.id }, data })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await db.studyNote.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
