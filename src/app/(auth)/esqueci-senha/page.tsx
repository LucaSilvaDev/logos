"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Loader2 } from "lucide-react"

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
    <div className="min-h-screen bg-[#12111e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <BookOpen className="w-8 h-8 text-[#c9a654] opacity-60 mx-auto mb-4" />
          <h1 className="font-display text-[#e2d9c5] text-lg tracking-widest uppercase">Selah</h1>
          <p className="text-[#55524a] text-xs mt-1 tracking-wider">Redefinir senha</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-[#c9c0a8] text-sm leading-relaxed">
              Se este email estiver cadastrado, você receberá um link para redefinir sua senha em breve.
            </p>
            <Link href="/entrar" className="text-[#c9a654] text-sm hover:opacity-80 transition-opacity">
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-[#8a8375] text-sm leading-relaxed mb-6">
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>

            {error && <p className="text-[#c96b5a] text-xs text-center">{error}</p>}

            <div className="space-y-1">
              <label className="text-[10px] text-[#3d3a55] uppercase tracking-wider font-display">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="app-input w-full px-3 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 btn-gold text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Enviar link de redefinição
            </button>

            <p className="text-center text-xs text-[#3d3a55] mt-4">
              <Link href="/entrar" className="text-[#c9a654] hover:opacity-80 transition-opacity">
                Voltar ao login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
