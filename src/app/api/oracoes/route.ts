import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { sanitizePlainText } from "@/lib/sanitize"

const schema = z.object({
  title:    z.string().min(1).max(200),
  content:  z.string().max(5000).default(""),
  category: z.enum(["personal", "family", "church", "missions"]).default("personal"),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const prayer = await db.prayer.create({
    data: {
      userId:   session.user.id,
      ...parsed.data,
      title:    sanitizePlainText(parsed.data.title),
      content:  sanitizePlainText(parsed.data.content),
    },
  })

  return NextResponse.json(prayer)
}
