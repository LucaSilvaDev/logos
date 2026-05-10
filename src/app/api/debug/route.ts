import { NextResponse } from "next/server"
import { createClient } from "@libsql/client"

export async function GET() {
  const rawUrl = process.env.TURSO_DATABASE_URL ?? ""
  const authToken = process.env.TURSO_AUTH_TOKEN
  const httpsUrl = rawUrl.replace(/^libsql:\/\//, "https://")

  const env = {
    TURSO_DATABASE_URL: rawUrl ? rawUrl.slice(0, 50) : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "MISSING",
  }

  // Test 1: libsql:// protocol
  let libsqlTest: string
  try {
    const c = createClient({ url: rawUrl, authToken })
    await c.execute("SELECT 1")
    libsqlTest = "OK"
  } catch (e) { libsqlTest = String(e) }

  // Test 2: https:// protocol
  let httpsTest: string
  try {
    const c = createClient({ url: httpsUrl, authToken })
    await c.execute("SELECT 1")
    httpsTest = "OK"
  } catch (e) { httpsTest = String(e) }

  // Test 3: Prisma via db.ts
  let prismaTest: string
  try {
    const { db } = await import("@/lib/db")
    const n = await db.user.count()
    prismaTest = `OK - ${n} users`
  } catch (e) { prismaTest = String(e) }

  return NextResponse.json({ env, libsqlTest, httpsTest, prismaTest })
}
