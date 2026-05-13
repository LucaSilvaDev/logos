import { NextResponse } from "next/server"
import webpush from "web-push"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL ?? "mailto:noreply@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
    process.env.VAPID_PRIVATE_KEY ?? "",
  )
  const auth = req.headers.get("authorization") ?? ""
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const now = new Date()
  const hh  = now.getUTCHours().toString().padStart(2, "0")
  const mm  = now.getUTCMinutes().toString().padStart(2, "0")
  const time = `${hh}:${mm}`

  const profiles = await db.userProfile.findMany({
    where: { dailyReminderTime: time },
    select: { userId: true },
  })

  if (profiles.length === 0) return NextResponse.json({ sent: 0 })

  const userIds = profiles.map(p => p.userId)
  const subs = await db.pushSub.findMany({ where: { userId: { in: userIds } } })

  const payload = JSON.stringify({
    title: "Selah — Leitura do dia",
    body: "Sua leitura diária está esperando.",
    url: "/plano",
  })

  let sent = 0
  const dead: string[] = []

  await Promise.allSettled(
    subs.map(async sub => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
        sent++
      } catch (e: unknown) {
        const status = (e as { statusCode?: number }).statusCode
        if (status === 410 || status === 404) dead.push(sub.endpoint)
      }
    })
  )

  if (dead.length > 0) {
    await db.pushSub.deleteMany({ where: { endpoint: { in: dead } } })
  }

  return NextResponse.json({ sent, expired: dead.length })
}
