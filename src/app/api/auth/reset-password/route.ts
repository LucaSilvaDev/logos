import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  email: z.string().email().toLowerCase(),
  token: z.string().min(1).max(128),
  password: z.string().min(8).max(100).refine(
    (p) => Buffer.byteLength(p, "utf8") <= 72,
    { message: "Senha muito longa (máximo 72 bytes)." },
  ),
})

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  const { email, token, password } = parsed.data

  const record = await db.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  })

  if (!record || record.expires < new Date()) {
    return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)
  await db.user.update({ where: { email }, data: { password: hash } })
  await db.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } })

  return NextResponse.json({ ok: true })
}
