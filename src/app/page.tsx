import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#12111e] flex flex-col items-center justify-center p-6 overflow-hidden relative">

      {/* Atmospheric background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="landing-glow" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-xs">

        {/* Icon */}
        <div className="landing-icon-glow mb-8">
          <BookOpen className="w-10 h-10 text-[#c9a654]" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 className="font-display text-[#e2d9c5] text-2xl tracking-[0.35em] uppercase mb-2">
          Selah
        </h1>
        <p className="text-[#55524a] text-[10px] tracking-[0.3em] uppercase font-sans mb-10">
          Pausa · Medita · Reflete
        </p>

        {/* Verse */}
        <p className="font-serif italic text-[#55524a] text-sm leading-relaxed mb-1">
          &ldquo;A tua palavra é lâmpada<br />que ilumina os meus passos&rdquo;
        </p>
        <p className="text-[#c9a654] text-[9px] tracking-widest uppercase font-display opacity-50 mb-12">
          Salmos 119:105
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/entrar"
            className="btn-gold py-3 text-sm font-serif tracking-wide text-center rounded-lg"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="py-3 text-sm font-serif tracking-wide text-center text-[#55524a] border border-[#2e2b42] rounded-lg hover:border-[#3d3a55] hover:text-[#8a8375] transition-colors"
          >
            Criar conta
          </Link>
        </div>

        {/* Confessional footer */}
        <p className="text-[#3d3a55] text-[8px] uppercase tracking-widest font-sans mt-12">
          Reformado · TULIP · Pós-Trib
        </p>
      </div>
    </div>
  )
}
