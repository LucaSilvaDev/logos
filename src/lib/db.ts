import { PrismaLibSql } from "@prisma/adapter-libsql"
import { PrismaClient } from "@/generated/prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrisma() {
  const rawUrl = process.env.TURSO_DATABASE_URL ?? ""
  const authToken = process.env.TURSO_AUTH_TOKEN

  // Vercel serverless is more compatible with https:// than libsql:// (WebSocket)
  const url = rawUrl.replace(/^libsql:\/\//, "https://")

  const adapter = new PrismaLibSql({ url, authToken })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any)
}

export const db = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
