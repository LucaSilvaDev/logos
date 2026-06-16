import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  theologicalLine:     z.string().min(1).max(100).optional(),
  calvinPoints:        z.string().min(1).max(100).optional(),
  eschatologyPosition: z.string().min(1).max(100).optional(),
  preferredVersions:   z.string().max(50).optional(),
  dailyReminderTime:   z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const profile = await db.userProfile.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json(profile)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  const data = parsed.data

  const profile = await db.userProfile.upsert({
    where:  { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  })

  return NextResponse.json(profile)
}
