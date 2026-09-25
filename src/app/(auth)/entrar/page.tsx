"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { AuthShell, GoogleMark } from "@/components/auth/AuthShell"
import { safeAppPath } from "@/lib/safe-next"

function LoginForm() {
  const searchParams = useSearchParams()
  const nextPath = safeAppPath(searchParams.get("callbackUrl") ?? searchParams.get("next"))
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) {
      setError("Email ou senha incorretos.")
      setLoading(false)
    } else {
      window.location.href = nextPath
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn("google", { callbackUrl: nextPath })
  }

  return (
    <AuthShell
      title="Entre para continuar a leitura."
      lede="Seu plano, seus grifos e o último capítulo ficam aqui."
    >
      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="btn-pill-ghost mb-1"
      >
        {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleMark />}
        Entrar com Google
      </button>

      <div className="auth-divider"><span>ou email</span></div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-[#c96b5a] bg-[#c96b5a]/8 border border-[#c96b5a]/20 rounded-2xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="auth-field-group">
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

        <div className="auth-field-group">
          <label className="auth-label">Senha</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
              className="auth-field pr-10"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a7a1] hover:text-[#1a1614] transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-ink mt-1">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Entrando…" : "Entrar →"}
        </button>

        <p className="text-center text-sm text-[#66635f]">
          <Link href="/esqueci-senha" className="hover:text-[#1a1614] transition-colors">
            Esqueci minha senha
          </Link>
        </p>
      </form>

      <p className="text-center text-sm text-[#66635f] mt-6">
        Não tem conta?{" "}
        <Link href={`/cadastro?callbackUrl=${encodeURIComponent(nextPath)}`} className="text-[#1a1614] underline-offset-4 hover:underline">
          Criar conta →
        </Link>
      </p>
    </AuthShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
