import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  title:    z.string().min(1).max(200).optional(),
  content:  z.string().min(1).optional(),
  bibleRef: z.string().max(100).nullable().optional(),
  tags:     z.string().max(500).optional(),
  mood:     z.string().max(10).nullable().optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const devotional = await db.devotional.findUnique({ where: { id, userId: session.user.id } })
  if (!devotional) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(devotional)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const devotional = await db.devotional.updateMany({
    where: { id, userId: session.user.id },
    data: parsed.data,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await db.devotional.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
