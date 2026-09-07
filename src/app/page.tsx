import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="auth-page">
      <div className="auth-inner">
        <nav className="auth-nav animate-fade-up">
          <span className="text-[16px] text-[#17191c]">Selah</span>
          <span className="text-[14px] text-[#979799]">Pausa · Medita · Contempla</span>
        </nav>

        <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <h1 className="auth-title max-w-2xl animate-fade-up delay-60">
            A palavra, com espaço para <em>respirar</em>.
          </h1>
          <p className="auth-lede animate-fade-up delay-140">
            Leitura, plano e meditação — no mesmo lugar, sem pressa.
          </p>

          <div className="mt-10 flex w-full max-w-sm flex-col sm:flex-row gap-3 animate-fade-up delay-220">
            <Link href="/entrar" className="btn-ink">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-pill-ghost">
              Criar conta
            </Link>
          </div>

          <aside className="quote-card quote-card-accent mt-16 max-w-sm text-left animate-fade-up delay-220">
            <p className="font-serif text-[20px] leading-snug">
              Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.
            </p>
            <p className="quote-cite mt-4">Salmos 119:105</p>
          </aside>
        </div>
      </div>
    </main>
  )
}
