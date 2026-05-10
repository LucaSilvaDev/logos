import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"

const schema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
    }

    const { name, email, password } = parsed.data

    const exists = await db.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: "Este email já está cadastrado." }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: { name, email, password: hash },
    })

    // Criar perfil teológico padrão
    await db.userProfile.create({
      data: { userId: user.id },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
