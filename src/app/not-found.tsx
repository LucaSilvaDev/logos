import Link from "next/link"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <main className="auth-page">
      <div className="auth-inner flex flex-col items-center justify-center text-center py-24">
        <p className="font-serif text-[5rem] leading-none text-[#ececec]">404</p>
        <h1 className="auth-title mt-4">Esta página não existe.</h1>
        <p className="auth-lede mb-10">O caminho não está no Selah.</p>
        <Link href="/dashboard" className="btn-ink inline-flex items-center gap-2">
          <Home className="w-4 h-4" /> Ir para o início
        </Link>
      </div>
    </main>
  )
}
