"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { AuthShell } from "@/components/auth/AuthShell"

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get("token") ?? ""
  const email = params.get("email") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError("As senhas não coincidem."); return }
    if (password.length < 8) { setError("A senha deve ter pelo menos 8 caracteres."); return }

    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Erro ao redefinir senha.")
      setLoading(false)
      return
    }
    setDone(true)
    setTimeout(() => router.push("/entrar"), 2500)
  }

  if (!token || !email) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-[#c96b5a]">Link inválido ou expirado.</p>
        <Link href="/esqueci-senha" className="btn-ink">Solicitar novo link →</Link>
      </div>
    )
  }

  if (done) {
    return (
      <p className="text-center text-sm text-[#66635f]">
        Senha redefinida. Redirecionando…
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-[#c96b5a] bg-[#c96b5a]/8 border border-[#c96b5a]/20 rounded-2xl px-3 py-2">
          {error}
        </p>
      )}

      <div>
        <label className="auth-label">Nova senha</label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="auth-field pr-10"
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a7a1] hover:text-[#1a1614] transition-colors">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="auth-label">Confirmar senha</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          placeholder="••••••••"
          className="auth-field"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-ink">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Redefinir senha →
      </button>
    </form>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <AuthShell
      kicker="Senha"
      title="Escolha uma senha nova."
    >
      <Suspense fallback={<p className="text-sm text-[#66635f] text-center">Carregando…</p>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  )
}
