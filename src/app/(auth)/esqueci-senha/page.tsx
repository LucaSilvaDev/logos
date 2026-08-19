"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { AuthShell } from "@/components/auth/AuthShell"

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError("Erro ao enviar email. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      kicker="Senha"
      title="Enviamos o caminho de volta."
      lede="Digite o email da conta. Se existir, o link chega em seguida."
    >
      {sent ? (
        <div className="text-center space-y-4">
          <p className="text-sm leading-relaxed text-[#66635f]">
            Se este email estiver cadastrado, você receberá um link para redefinir sua senha.
          </p>
          <Link href="/entrar" className="btn-ink">
            Voltar ao login →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-[#c96b5a] bg-[#c96b5a]/8 border border-[#c96b5a]/20 rounded-2xl px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="auth-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              autoComplete="email"
              className="auth-field"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-ink">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Enviando…" : "Enviar link →"}
          </button>

          <p className="text-center text-sm text-[#66635f]">
            <Link href="/entrar" className="text-[#1a1614] underline-offset-4 hover:underline">
              Voltar ao login
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}
