import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  title:   z.string().min(1).max(300),
  content: z.string().min(1),
  book:    z.string().min(1).max(100),
  chapter: z.number().int().positive().nullable().optional(),
  verse:   z.number().int().positive().nullable().optional(),
  type:    z.enum(["exegesis", "theology", "application", "word_study", "cross_ref"]).default("exegesis"),
  tags:    z.string().max(500).default(""),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const note = await db.studyNote.create({
    data: { userId: session.user.id, ...parsed.data },
  })

  return NextResponse.json(note)
}
