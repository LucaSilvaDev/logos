import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { getPassage, PLAN_CONFIG } from "@/lib/reading-plan"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id

  const profile = await db.userProfile.findUnique({ where: { userId } })
  const planType = profile?.readingPlanType ?? "1y"

  const count = await db.readingPlanProgress.count({ where: { userId } })
  const nextDay = count + 1
  const passage = getPassage(planType, nextDay)

  // Find or create a ReadingPlan record for this plan type
  let plan = await db.readingPlan.findFirst({ where: { type: planType } })
  if (!plan) {
    const config = PLAN_CONFIG[planType]
    plan = await db.readingPlan.create({
      data: {
        name: config?.label ?? planType,
        type: planType,
        totalDays: config?.days ?? 365,
      },
    })
  }

  // Find or create the ReadingDay record, updating passage if needed
  let readingDay = await db.readingDay.findFirst({ where: { planId: plan.id, day: nextDay } })
  if (!readingDay) {
    readingDay = await db.readingDay.create({
      data: { planId: plan.id, day: nextDay, passages: passage },
    })
  } else if (readingDay.passages !== passage) {
    readingDay = await db.readingDay.update({
      where: { id: readingDay.id },
      data: { passages: passage },
    })
  }

  await db.readingPlanProgress.upsert({
    where: { userId_readingDayId: { userId, readingDayId: readingDay.id } },
    create: { userId, readingDayId: readingDay.id },
    update: { completedAt: new Date() },
  })

  return NextResponse.redirect(new URL("/plano", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
}
