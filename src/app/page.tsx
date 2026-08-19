import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-1" aria-hidden />
      <div className="auth-orb auth-orb-2" aria-hidden />

      <div className="auth-inner">
        <nav className="auth-nav animate-fade-up">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#c9a654]" strokeWidth={1.6} />
            <span className="font-display text-[13px] tracking-[0.22em] uppercase text-[#1a1614]">
              Selah
            </span>
          </div>
          <span className="text-[11px] text-[#66635f]">Reformado · TULIP</span>
        </nav>

        <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <p className="auth-kicker animate-fade-up delay-60">Pausa · Medita · Contempla</p>
          <h1 className="auth-title max-w-lg animate-fade-up delay-60">
            A palavra, com espaço para respirar.
          </h1>
          <p className="auth-lede animate-fade-up delay-140">
            &ldquo;A tua palavra é lâmpada que ilumina os meus passos&rdquo;
            <span className="block mt-2 text-[11px] tracking-[0.16em] uppercase text-[#c9a654]">
              Salmos 119:105
            </span>
          </p>

          <div className="mt-10 flex w-full max-w-xs flex-col gap-3 animate-fade-up delay-220">
            <Link href="/entrar" className="btn-ink">
              Entrar →
            </Link>
            <Link href="/cadastro" className="btn-pill-ghost">
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
