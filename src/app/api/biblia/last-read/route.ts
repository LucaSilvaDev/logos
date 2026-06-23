import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json(null)

  const pos = await db.lastReadPosition.findUnique({
    where: { userId: session.user.id },
    select: { bookId: true, chapter: true, version: true },
  })
  return NextResponse.json(pos)
}

const schema = z.object({
  bookId:  z.string().min(2).max(10),
  chapter: z.number().int().min(1).max(150),
  version: z.enum(["nvi", "naa", "nvt"]),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 })

  const { bookId, chapter, version } = parsed.data

  await db.lastReadPosition.upsert({
    where:  { userId: session.user.id },
    update: { bookId, chapter, version },
    create: { userId: session.user.id, bookId, chapter, version },
  })

  return NextResponse.json({ ok: true })
}
