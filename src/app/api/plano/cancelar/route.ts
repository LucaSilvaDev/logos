import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id

  // Delete all progress for this user so they start fresh with a new plan
  await db.readingPlanProgress.deleteMany({ where: { userId } })

  // Clear the plan type
  await db.userProfile.upsert({
    where: { userId },
    create: { userId, readingPlanType: null },
    update: { readingPlanType: null },
  })

  return NextResponse.json({ ok: true })
}
