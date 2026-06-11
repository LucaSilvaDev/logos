import Link from "next/link"
import { BookOpen, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-glass-base flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-white/25" />
        </div>
        <h1 className="text-5xl font-black text-white/10 mb-2">404</h1>
        <p className="text-white/50 font-semibold text-lg mb-1">Página não encontrada</p>
        <p className="text-white/25 text-sm mb-8">Este caminho não existe no sistema devocional.</p>
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c9a65415] border border-[#c9a65430] text-[#c9a654] hover:bg-[#c9a65425] transition-all text-sm font-medium">
          <Home className="w-4 h-4" /> Ir para o Dashboard
        </Link>
      </div>
    </div>
  )
}
