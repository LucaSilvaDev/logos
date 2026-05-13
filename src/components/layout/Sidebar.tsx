"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BookOpen, LayoutDashboard, NotebookPen, Search,
  Clock, Church, Flame, Library, Heart, X, UserCircle
} from "lucide-react"

const navItems = [
  { href: "/dashboard",   icon: LayoutDashboard, label: "Início" },
  { href: "/biblia",      icon: BookOpen,         label: "Bíblia" },
  { href: "/plano",       icon: Clock,            label: "Plano de Leitura" },
  { href: "/devocional",  icon: NotebookPen,      label: "Devocional" },
  { href: "/estudo",      icon: Search,           label: "Estudo" },
  { href: "/oracoes",     icon: Heart,            label: "Orações" },
  { href: "/historia",    icon: Church,           label: "História" },
  { href: "/escatologia", icon: Flame,            label: "Escatologia" },
  { href: "/biblioteca",  icon: Library,          label: "Biblioteca" },
  { href: "/perfil",      icon: UserCircle,       label: "Perfil" },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "flex flex-col w-56 shrink-0 sidebar",
        // Mobile: overlay deslizante
        "fixed inset-y-0 left-0 z-40",
        "transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "-translate-x-full",
        // Desktop: sempre visível, parte do fluxo
        "md:relative md:translate-x-0 md:z-auto md:flex"
      )}>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between h-16 px-5">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#c9a654] opacity-75" />
            <div>
              <p className="font-display text-[#e2d9c5] text-sm tracking-[0.25em] uppercase">Selah</p>
              <p className="text-[#3d3a55] text-[8px] tracking-widest uppercase font-sans mt-0.5">Pausa · Medita · Reflete</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-[#3d3a55] hover:text-[#8a8375] transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-5 h-px bg-[#2e2b42] opacity-50" />

        {/* Navegação */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200",
                  active ? "nav-glow-active" : "nav-glow text-[#55524a]"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 shrink-0 transition-colors duration-200",
                  active ? "text-[#c9a654]" : "text-[#3d3a55] group-hover:text-[#8a8375]"
                )} />
                <span className={cn("font-serif", active && "font-medium")}>{label}</span>
                {active && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-[#c9a654] opacity-60 shrink-0" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Rodapé confessional */}
        <div className="px-5 py-5">
          <div className="h-px bg-[#2e2b42] opacity-40 mb-4" />
          <p className="text-[#3d3a55] text-[8px] uppercase tracking-widest font-sans mb-1.5">Confissão</p>
          <p className="text-[#55524a] text-[10px] leading-relaxed font-serif italic">
            Reformado · TULIP<br />
            <span className="text-[#c9a654] opacity-40 not-italic">Pós-Trib · Pré-Mil Histórico</span>
          </p>
        </div>
      </aside>
    </>
  )
}
