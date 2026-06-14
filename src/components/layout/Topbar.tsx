"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
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
  "/progresso":   "Progresso",
}

const BOOK_ID_NAMES: Record<string, string> = {
  GEN:"Gênesis",EXO:"Êxodo",LEV:"Levítico",NUM:"Números",DEU:"Deuteronômio",
  JOS:"Josué",JDG:"Juízes",RUT:"Rute","1SA":"1 Samuel","2SA":"2 Samuel",
  "1KI":"1 Reis","2KI":"2 Reis","1CH":"1 Crônicas","2CH":"2 Crônicas",
  EZR:"Esdras",NEH:"Neemias",EST:"Ester",JOB:"Jó",PSA:"Salmos",PRO:"Provérbios",
  ECC:"Eclesiastes",SNG:"Cânticos",ISA:"Isaías",JER:"Jeremias",LAM:"Lamentações",
  EZK:"Ezequiel",DAN:"Daniel",HOS:"Oséias",JOL:"Joel",AMO:"Amós",OBA:"Obadias",
  JON:"Jonas",MIC:"Miquéias",NAH:"Naum",HAB:"Habacuque",ZEP:"Sofonias",
  HAG:"Ageu",ZEC:"Zacarias",MAL:"Malaquias",MAT:"Mateus",MRK:"Marcos",
  LUK:"Lucas",JHN:"João",ACT:"Atos",ROM:"Romanos","1CO":"1 Coríntios",
  "2CO":"2 Coríntios",GAL:"Gálatas",EPH:"Efésios",PHP:"Filipenses",COL:"Colossenses",
  "1TH":"1 Tessalonicenses","2TH":"2 Tessalonicenses","1TI":"1 Timóteo","2TI":"2 Timóteo",
  TIT:"Tito",PHM:"Filemom",HEB:"Hebreus",JAS:"Tiago","1PE":"1 Pedro","2PE":"2 Pedro",
  "1JN":"1 João","2JN":"2 João","3JN":"3 João",JUD:"Judas",REV:"Apocalipse",
}

function getTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return title
  }
  return "Selah"
}

function readBiblePos() {
  try {
    const raw = localStorage.getItem("selah-bible-pos")
    if (!raw) return null
    const p = JSON.parse(raw)
    const name = BOOK_ID_NAMES[p.bookId]
    if (name && typeof p.chapter === "number") return { bookName: name, chapter: p.chapter as number }
  } catch { /* ignore */ }
  return null
}

function useBiblePos() {
  const [pos, setPos] = useState<{ bookName: string; chapter: number } | null>(null)
  useEffect(() => {
    setPos(readBiblePos())
    function refresh() { setPos(readBiblePos()) }
    window.addEventListener("selah-bible-pos", refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener("selah-bible-pos", refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])
  return pos
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
  const isBible = pathname.startsWith("/biblia")
  const biblePos = useBiblePos()

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

        {/* Page title + Bible context */}
        <div className="flex-1 flex justify-center md:justify-start">
          {isBible && biblePos ? (
            <div className="hidden md:flex flex-col leading-none gap-0.5">
              <span className="font-display text-[#8a8375] text-[9px] tracking-[0.2em] uppercase">Bíblia</span>
              <span className="font-serif text-[#c9c0a8] text-[13px]">
                {biblePos.bookName} <span className="text-[#55524a]">cap.</span> {biblePos.chapter}
              </span>
            </div>
          ) : (
            <span className="font-display text-[#8a8375] text-[11px] tracking-[0.2em] uppercase">
              {title}
            </span>
          )}
          {/* Mobile: always show plain title */}
          {isBible && biblePos && (
            <span className="md:hidden font-display text-[#8a8375] text-[11px] tracking-[0.2em] uppercase">
              Bíblia
            </span>
          )}
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
