import Link from "next/link"
import { BookOpen } from "lucide-react"

export function AuthShell({
  kicker,
  title,
  lede,
  children,
}: {
  kicker?: string
  title: string
  lede?: string
  children: React.ReactNode
}) {
  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-1" aria-hidden />
      <div className="auth-orb auth-orb-2" aria-hidden />

      <div className="auth-inner">
        <nav className="auth-nav animate-fade-up">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-4 h-4 text-[#c9a654] shrink-0" strokeWidth={1.6} />
            <span className="font-display text-[13px] tracking-[0.22em] uppercase text-[#1a1614]">
              Selah
            </span>
          </Link>
          <span className="text-[11px] text-[#66635f] tracking-wide truncate">
            Pausa · Medita · Contempla
          </span>
        </nav>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">
            <div className="auth-hero animate-fade-up delay-60">
              {kicker && <p className="auth-kicker">{kicker}</p>}
              <h1 className="auth-title">{title}</h1>
              {lede && <p className="auth-lede">{lede}</p>}
            </div>
            <div className="auth-card animate-fade-up delay-140">
              {children}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export function GoogleMark() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
