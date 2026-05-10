import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  planType: z.enum(["1y", "6m", "nt-3m", "nt-1m", "ot-1y", "ot-6m", "salmos", "evang"]),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })

  await db.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, readingPlanType: parsed.data.planType },
    update: { readingPlanType: parsed.data.planType },
  })

  return NextResponse.json({ ok: true })
}
