"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import { BookOpen, Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
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
      window.location.href = "/dashboard"
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen bg-[#12111e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logotipo */}
        <div className="text-center mb-10">
          <BookOpen className="w-8 h-8 text-[#c9a654] opacity-60 mx-auto mb-4" />
          <h1 className="font-display text-[#e2d9c5] text-lg tracking-widest uppercase">Selah</h1>
          <p className="text-[#55524a] text-xs mt-1 tracking-wider">Pausa · Medita · Reflete</p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#2e2b42] text-[#8a8375] text-sm hover:border-[#3d3a55] hover:text-[#c9c0a8] transition-colors disabled:opacity-50 mb-6 font-serif"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Entrar com Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-[#2e2b42]" />
          <span className="text-[10px] text-[#3d3a55] uppercase tracking-wider font-display">ou email</span>
          <div className="flex-1 h-px bg-[#2e2b42]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-[#c96b5a] text-xs text-center">{error}</p>
          )}

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

          <div className="space-y-1">
            <label className="text-[10px] text-[#3d3a55] uppercase tracking-wider font-display">Senha</label>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d3a55] hover:text-[#55524a] transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 btn-gold text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Entrar
          </button>
        </form>

        <p className="text-center text-xs text-[#3d3a55] mt-6">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-[#c9a654] hover:opacity-80 transition-opacity">
            Criar conta
          </Link>
        </p>

        <p className="text-center text-[10px] text-[#3d3a55] mt-10 font-serif italic leading-relaxed">
          &ldquo;A tua palavra é lâmpada que ilumina os meus passos&rdquo;<br />
          <span className="not-italic text-[#c9a654] opacity-40">Salmos 119:105</span>
        </p>
      </div>
    </div>
  )
}
