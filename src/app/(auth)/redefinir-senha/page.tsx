"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, Loader2, Eye, EyeOff } from "lucide-react"

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
        <p className="text-[#c96b5a] text-sm">Link inválido ou expirado.</p>
        <Link href="/esqueci-senha" className="text-[#c9a654] text-sm hover:opacity-80">Solicitar novo link</Link>
      </div>
    )
  }

  return done ? (
    <div className="text-center space-y-3">
      <p className="text-[#c9c0a8] text-sm">Senha redefinida com sucesso! Redirecionando…</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-[#c96b5a] text-xs text-center">{error}</p>}

      <div className="space-y-1">
        <label className="text-[10px] text-[#4a3826] uppercase tracking-wider font-display">Nova senha</label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="app-input w-full px-3 py-2.5 pr-10 text-sm"
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a3826] hover:text-[#55524a] transition-colors">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-[#4a3826] uppercase tracking-wider font-display">Confirmar senha</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          placeholder="••••••••"
          className="app-input w-full px-3 py-2.5 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 btn-gold text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Redefinir senha
      </button>
    </form>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen bg-[#1c1510] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <BookOpen className="w-8 h-8 text-[#c9a654] opacity-60 mx-auto mb-4" />
          <h1 className="font-display text-[#e2d9c5] text-lg tracking-widest uppercase">Selah</h1>
          <p className="text-[#55524a] text-xs mt-1 tracking-wider">Nova senha</p>
        </div>
        <Suspense>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
