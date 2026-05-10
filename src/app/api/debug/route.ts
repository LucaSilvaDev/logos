import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const userCount = await db.user.count()
    return NextResponse.json({
      ok: true,
      db: "connected",
      users: userCount,
      env: {
        turso: !!process.env.TURSO_DATABASE_URL,
        authSecret: !!process.env.NEXTAUTH_SECRET,
        googleId: !!process.env.GOOGLE_CLIENT_ID,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    )
  }
}
