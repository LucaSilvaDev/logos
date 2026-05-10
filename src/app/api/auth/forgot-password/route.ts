import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: "Email obrigatório" }, { status: 400 })

  const user = await db.user.findUnique({ where: { email } })
  // Não revela se o email existe ou não (segurança)
  if (!user || !user.password) {
    return NextResponse.json({ ok: true })
  }

  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hora

  await db.verificationToken.upsert({
    where: { identifier_token: { identifier: email, token } },
    create: { identifier: email, token, expires },
    update: { token, expires },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://logos-flame-tau.vercel.app"
  const link = `${baseUrl}/redefinir-senha?token=${token}&email=${encodeURIComponent(email)}`

  await resend.emails.send({
    from: "Selah <noreply@resend.dev>",
    to: email,
    subject: "Redefinição de senha — Selah",
    html: `
      <div style="font-family:serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <h2 style="font-weight:400;letter-spacing:2px;text-transform:uppercase;font-size:14px;color:#888">Selah · Estudo Bíblico</h2>
        <h1 style="font-weight:400;font-size:22px">Redefinição de senha</h1>
        <p style="color:#444;line-height:1.6">
          Recebemos uma solicitação para redefinir a senha da sua conta.<br>
          Clique no link abaixo para criar uma nova senha:
        </p>
        <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#c9a654;color:#fff;text-decoration:none;font-size:14px;letter-spacing:1px">
          REDEFINIR SENHA
        </a>
        <p style="color:#888;font-size:12px">
          Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este email.
        </p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
