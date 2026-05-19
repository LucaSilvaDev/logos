import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const version = searchParams.get("version") ?? "nvi"
  const limit   = Math.min(parseInt(searchParams.get("limit") ?? "10"), 20)

  const total = await db.bibleVerse.count({ where: { version } })
  if (total === 0) return NextResponse.json([])

  // Pick a random window inside the full table
  const skip = Math.floor(Math.random() * Math.max(1, total - limit * 3))

  const pool = await db.bibleVerse.findMany({
    where:   { version },
    skip,
    take:    limit * 3,
  })

  // Keep only medium-length verses (avoids stub "see above" verses and marathon passages)
  const filtered = pool
    .filter(v => v.text.length >= 45 && v.text.length <= 280)
    .slice(0, limit)

  return NextResponse.json(filtered)
}
