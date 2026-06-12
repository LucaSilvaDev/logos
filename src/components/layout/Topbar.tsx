"use client"

import { usePathname } from "next/navigation"
import { User, Menu, Sun, Moon } from "lucide-react"
import Link from "next/link"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":   "Início",
  "/biblia":      "Bíblia",
  "/plano":       "Plano de Leitura",
  "/devocional":  "Devocional",
  "/estudo":      "Estudo",
  "/oracoes":     "Orações",
  "/historia":    "História",
  "/escatologia": "Escatologia",
  "/biblioteca":  "Biblioteca",
  "/perfil":      "Perfil",
  "/memorizar":   "Memorizar",
}

function getTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return title
  }
  return "Selah"
}

interface TopbarProps {
  userName?: string | null
  userImage?: string | null
  theme: "dark" | "light"
  onToggleSidebar: () => void
  onToggleTheme: () => void
}

export function Topbar({ userName, userImage, theme, onToggleSidebar, onToggleTheme }: TopbarProps) {
  const pathname = usePathname()
  const title = getTitle(pathname)

  return (
    <header className="topbar z-20 flex-shrink-0">
      <div className="h-14 flex items-center px-4 gap-2">

        {/* Hamburger — mobile only */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-[#3d3a55] hover:text-[#c9a654] transition-colors duration-200 p-1.5 rounded-lg hover:bg-[#1a1928]"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page title */}
        <div className="flex-1 flex justify-center md:justify-start">
          <span className="font-display text-[#8a8375] text-[11px] tracking-[0.2em] uppercase">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="text-[#3d3a55] hover:text-[#c9a654] transition-colors duration-200 p-1.5 rounded-lg hover:bg-[#1a1928]"
            aria-label={theme === "dark" ? "Tema claro" : "Tema escuro"}
            title={theme === "dark" ? "Tema claro" : "Tema escuro"}
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />
            }
          </button>

          {/* Avatar → perfil (logout moved to Perfil page) */}
          <Link href="/perfil" title="Perfil" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {userImage ? (
              <img src={userImage} alt="" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#211f31]/60 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-[#55524a]" />
              </div>
            )}
            <span className="text-[13px] text-[#55524a] font-serif hidden sm:block">{userName}</span>
          </Link>
        </div>

      </div>
    </header>
  )
}
