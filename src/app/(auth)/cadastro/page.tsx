"use client"

import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { AuthShell, GoogleMark } from "@/components/auth/AuthShell"

export default function CadastroPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Erro ao criar conta.")
      setLoading(false)
      return
    }
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" })
  }

  return (
    <AuthShell
      title="Crie o espaço da sua leitura."
      lede="Uma conta para plano, notas e memorização — no seu ritmo."
    >
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="btn-pill-ghost mb-1"
      >
        <GoogleMark />
        Cadastrar com Google
      </button>

      <div className="auth-divider"><span>ou email</span></div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-[#c96b5a] bg-[#c96b5a]/8 border border-[#c96b5a]/20 rounded-2xl px-3 py-2">
            {error}
          </p>
        )}

        <div>
          <label className="auth-label">Nome</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required
            placeholder="Seu nome" autoComplete="name" className="auth-field" />
        </div>

        <div>
          <label className="auth-label">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="seu@email.com" autoComplete="email" className="auth-field" />
        </div>

        <div>
          <label className="auth-label">
            Senha <span className="font-normal text-[#a8a7a1]">· mín. 8 caracteres</span>
          </label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              required minLength={8} placeholder="••••••••" autoComplete="new-password"
              className="auth-field pr-10" />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a7a1] hover:text-[#1a1614] transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-ink mt-1">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Criando…" : "Criar conta →"}
        </button>
      </form>

      <p className="text-center text-sm text-[#66635f] mt-6">
        Já tem conta?{" "}
        <Link href="/entrar" className="text-[#1a1614] underline-offset-4 hover:underline">
          Entrar →
        </Link>
      </p>
    </AuthShell>
  )
}
