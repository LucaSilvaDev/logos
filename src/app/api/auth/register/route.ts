import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"

// bcrypt silently truncates passwords longer than 72 bytes — reject explicitly
// so users aren't surprised when only the first 72 bytes count on login.
const schema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email().max(254).toLowerCase(),
  password: z.string().min(8).max(100).refine(
    (p) => Buffer.byteLength(p, "utf8") <= 72,
    { message: "Senha muito longa (máximo 72 bytes)." },
  ),
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
    }

    const { name, email, password } = parsed.data

    // Always return the same generic success response — never reveals whether
    // the e-mail is already registered. Real conflicts are silently dropped.
    const exists = await db.user.findUnique({ where: { email } })
    if (!exists) {
      const hash = await bcrypt.hash(password, 12)
      const user = await db.user.create({
        data: { name, email, password: hash },
      })
      await db.userProfile.create({ data: { userId: user.id } })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
