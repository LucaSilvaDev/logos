import { NextResponse } from "next/server"
import { createClient } from "@libsql/client"

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  const env = {
    TURSO_DATABASE_URL: tursoUrl ? tursoUrl.slice(0, 50) + "..." : "MISSING",
    TURSO_AUTH_TOKEN: tursoToken ? "SET" : "MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "MISSING",
    DATABASE_URL: process.env.DATABASE_URL ?? "MISSING",
  }

  // Test direct libsql connection (bypasses Prisma)
  let directTest: string
  try {
    if (!tursoUrl) throw new Error("TURSO_DATABASE_URL not set")
    const client = createClient({ url: tursoUrl, authToken: tursoToken })
    await client.execute("SELECT 1")
    directTest = "OK"
  } catch (err) {
    directTest = String(err)
  }

  // Test Prisma
  let prismaTest: string
  try {
    const { db } = await import("@/lib/db")
    const count = await db.user.count()
    prismaTest = `OK - ${count} users`
  } catch (err) {
    prismaTest = String(err)
  }

  return NextResponse.json({ env, directTest, prismaTest })
}
