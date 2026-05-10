import { PrismaLibSql } from "@prisma/adapter-libsql"
import { PrismaClient } from "@/generated/prisma/client"
import path from "path"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrisma() {
  // O banco real está em c:\Biblia\logos\dev.db (criado pelo prisma migrate)
  const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/")
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any)
}

export const db = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
