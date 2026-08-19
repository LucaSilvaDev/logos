"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { ChevronDown, Moon, Sun, User } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { moreNav, primaryNav, isNavActive } from "@/lib/nav"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":   "Início",
  "/biblia":      "Bíblia",
  "/plano":       "Plano",
  "/devocional":  "Devocional",
  "/estudo":      "Estudo",
  "/oracoes":     "Orações",
  "/historia":    "História",
  "/escatologia": "Escatologia",
  "/biblioteca":  "Biblioteca",
  "/perfil":      "Perfil",
  "/memorizar":   "Memorizar",
  "/progresso":   "Progresso",
  "/busca":       "Busca",
}

function currentTitle(pathname: string) {
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return title
  }
  return "Selah"
}

interface AppNavProps {
  userName?: string | null
  userImage?: string | null
  theme: "dark" | "light"
  moreOpen: boolean
  onToggleMore: () => void
  onCloseMore: () => void
  onToggleTheme: () => void
}

export function AppNav({
  userName, userImage, theme, moreOpen, onToggleMore, onCloseMore, onToggleTheme,
}: AppNavProps) {
  const pathname = usePathname()
  const title = currentTitle(pathname)
  const panelRef = useRef<HTMLDivElement>(null)
  const moreBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    onCloseMore()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!moreOpen) return
    function onPointer(e: MouseEvent) {
      const t = e.target as Node
      if (panelRef.current?.contains(t) || moreBtnRef.current?.contains(t)) return
      onCloseMore()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseMore()
    }
    document.addEventListener("mousedown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [moreOpen, onCloseMore])

  return (
    <>
      <header className="app-float-nav">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 px-1 text-[16px]" onClick={onCloseMore}>
          Selah
        </Link>

        <span className="md:hidden text-[13px] opacity-45 truncate">{title}</span>

        <nav className="hidden md:flex items-center gap-0.5 flex-1 min-w-0 ml-2">
          {primaryNav.map(({ href, label }) => {
            const active = isNavActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onCloseMore}
                className={cn("app-nav-link", active && "app-nav-link-active")}
              >
                {label}
              </Link>
            )
          })}
          <button
            ref={moreBtnRef}
            type="button"
            onClick={onToggleMore}
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            className={cn("app-nav-link inline-flex items-center gap-1", moreOpen && "app-nav-link-active")}
          >
            Mais
            <ChevronDown className={cn("w-3 h-3 opacity-60 transition-transform duration-150", moreOpen && "rotate-180")} />
          </button>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleTheme}
            className="app-nav-icon"
            aria-label={theme === "dark" ? "Tema claro" : "Tema escuro"}
            title={theme === "dark" ? "Tema claro" : "Tema escuro"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link href="/perfil" title="Perfil" className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-lg hover:bg-white/5 transition-colors" onClick={onCloseMore}>
            {userImage ? (
              <img src={userImage} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-3 h-3 opacity-60" />
              </span>
            )}
            <span className="hidden sm:block text-[13px] opacity-70 max-w-[9rem] truncate">{userName}</span>
          </Link>
        </div>
      </header>

      {moreOpen && (
        <div ref={panelRef} className="app-more-panel" role="menu">
          {moreNav.map(({ href, icon: Icon, label }) => {
            const active = isNavActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={onCloseMore}
                className={cn("app-more-item", active && "app-more-item-active")}
              >
                <Icon className="w-4 h-4 opacity-55" strokeWidth={1.75} />
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
