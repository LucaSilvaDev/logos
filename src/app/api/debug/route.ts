import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const env = {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.slice(0, 40) + "..." : "MISSING",
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? "SET (hidden)" : "MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "MISSING",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "MISSING",
  }

  try {
    const userCount = await db.user.count()
    return NextResponse.json({ ok: true, db: "connected", users: userCount, env })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), env }, { status: 500 })
  }
}
