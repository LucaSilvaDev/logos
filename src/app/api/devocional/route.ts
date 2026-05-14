import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { sanitizeRichText, sanitizePlainText } from "@/lib/sanitize"

const schema = z.object({
  title:    z.string().min(1).max(200),
  content:  z.string().min(1),
  bibleRef: z.string().max(100).nullable().optional(),
  tags:     z.string().max(500).optional(),
  mood:     z.string().max(10).nullable().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const { title, content, bibleRef, tags, mood } = parsed.data
  const devotional = await db.devotional.create({
    data: {
      userId: session.user.id,
      title:    sanitizePlainText(title),
      content:  sanitizeRichText(content),
      bibleRef: bibleRef ? sanitizePlainText(bibleRef) : null,
      tags:     tags ? sanitizePlainText(tags) : "",
      mood:     mood ?? null,
    },
  })

  return NextResponse.json(devotional)
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const devotionals = await db.devotional.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, bibleRef: true, tags: true, createdAt: true },
  })

  return NextResponse.json(devotionals)
}
