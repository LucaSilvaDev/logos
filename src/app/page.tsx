import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="auth-page">
      <div className="auth-inner">
        <nav className="auth-nav animate-fade-up">
          <span className="text-[16px] text-[#17191c]">Selah</span>
          <span className="text-[14px] text-[#979799]">Reformado · TULIP</span>
        </nav>

        <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <p className="auth-kicker animate-fade-up delay-60">Pausa · Medita · Contempla</p>
          <h1 className="auth-title max-w-2xl animate-fade-up delay-60">
            A palavra, com espaço para <em>respirar</em>.
          </h1>
          <p className="auth-lede animate-fade-up delay-140">
            A tua palavra é lâmpada que ilumina os meus passos.
          </p>

          <div className="mt-10 flex w-full max-w-sm flex-col sm:flex-row gap-3 animate-fade-up delay-220">
            <Link href="/entrar" className="btn-ink">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-pill-ghost">
              Criar conta
            </Link>
          </div>

          <aside className="artifact-card mt-16 max-w-sm text-left animate-fade-up delay-220">
            <p className="page-kicker mb-3">Salmos 119:105</p>
            <p className="font-serif text-[20px] leading-snug text-[#17191c]">
              Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}
