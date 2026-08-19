"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BookOpen, LayoutDashboard, NotebookPen, Search, ScanSearch,
  Clock, Church, Flame, Library, Heart, X, UserCircle,
  ChevronsLeft, ChevronsRight, Brain, Map,
} from "lucide-react"

const primaryNav = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "Início" },
  { href: "/biblia",     icon: BookOpen,         label: "Bíblia" },
  { href: "/plano",      icon: Clock,            label: "Plano" },
  { href: "/devocional", icon: NotebookPen,      label: "Devocional" },
  { href: "/estudo",     icon: Search,           label: "Estudo" },
]

const moreNav = [
  { href: "/busca",       icon: ScanSearch,  label: "Busca" },
  { href: "/progresso",   icon: Map,         label: "Progresso" },
  { href: "/memorizar",   icon: Brain,       label: "Memorizar" },
  { href: "/oracoes",     icon: Heart,       label: "Orações" },
  { href: "/historia",    icon: Church,      label: "História" },
  { href: "/escatologia", icon: Flame,       label: "Escatologia" },
  { href: "/biblioteca",  icon: Library,     label: "Biblioteca" },
  { href: "/perfil",      icon: UserCircle,  label: "Perfil" },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

type NavItem = { href: string; icon: typeof BookOpen; label: string }

function NavGroup({
  items, pathname, collapsed, onClose,
}: {
  items: NavItem[]
  pathname: string
  collapsed: boolean
  onClose: () => void
}) {
  return (
    <div className="space-y-0.5">
      {items.map(({ href, icon: Icon, label }) => {
        const active = href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              "group relative flex items-center gap-3 px-3 py-2 rounded-full text-[13px] transition-all duration-200",
              collapsed && "md:justify-center md:px-2",
              active ? "nav-glow-active" : "nav-glow"
            )}
          >
            <Icon className={cn(
              "w-4 h-4 shrink-0 transition-colors duration-200",
              active ? "text-[#c9a654]" : "opacity-50 group-hover:opacity-80"
            )} />
            <span className={cn(
              "whitespace-nowrap overflow-hidden transition-all duration-200",
              collapsed ? "md:w-0 md:opacity-0" : "opacity-100"
            )}>
              {label}
            </span>
            <span className={cn(
              "pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2",
              "px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap",
              "nav-tooltip",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50",
              collapsed ? "hidden md:block" : "hidden"
            )}>
              {label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
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
        "flex flex-col shrink-0 sidebar overflow-hidden",
        "fixed inset-y-0 left-0 z-40",
        "transition-all duration-300 ease-out",
        // Mobile: sempre largura completa, overlay
        "w-56",
        open ? "translate-x-0" : "-translate-x-full",
        // Desktop: visível, largura depende do estado
        "md:relative md:translate-x-0 md:z-auto md:flex",
        collapsed ? "md:w-[60px]" : "md:w-56",
      )}>

        {/* Cabeçalho */}
        <div className={cn(
          "flex items-center h-16 px-4 gap-2.5 shrink-0",
          collapsed && "md:justify-center md:px-0"
        )}>
          <BookOpen className="w-4 h-4 text-[#c9a654] opacity-75 shrink-0" />
          <div className={cn(
            "transition-all duration-200 overflow-hidden",
            collapsed ? "md:w-0 md:opacity-0" : "opacity-100"
          )}>
            <p className="font-display text-[#e2d9c5] text-sm tracking-[0.22em] uppercase whitespace-nowrap">Selah</p>
            <p className="text-[9px] tracking-[0.14em] uppercase opacity-40 whitespace-nowrap mt-0.5">
              Pausa · Medita
            </p>
          </div>
          <button
            onClick={onClose}
            className={cn("ml-auto text-[#3d3a55] hover:text-[#8a8375] transition-colors md:hidden", collapsed && "hidden")}
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-4 h-px bg-[#2e2b42] opacity-20 shrink-0" />

        {/* Navegação */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <NavGroup items={primaryNav} pathname={pathname} collapsed={collapsed} onClose={onClose} />
          <p className={cn(
            "px-3 pt-5 pb-1 text-[10px] tracking-[0.16em] uppercase opacity-40",
            collapsed && "md:hidden"
          )}>
            Mais
          </p>
          <NavGroup items={moreNav} pathname={pathname} collapsed={collapsed} onClose={onClose} />
        </nav>

        {/* Rodapé confessional */}
        <div className={cn(
          "px-4 pt-0 pb-3 transition-all duration-200 overflow-hidden shrink-0",
          collapsed ? "md:h-0 md:opacity-0 md:pb-0" : "opacity-100"
        )}>
          <div className="h-px bg-[#2e2b42] opacity-40 mb-3" />
          <p className="text-[#3d3a55] text-[8px] uppercase tracking-widest font-sans mb-1.5 whitespace-nowrap">Confissão</p>
          <p className="text-[#55524a] text-[10px] leading-relaxed font-serif italic whitespace-nowrap">
            Reformado · TULIP<br />
            <span className="text-[#c9a654] opacity-40 not-italic">Pós-Trib · Pré-Mil Histórico</span>
          </p>
        </div>

        {/* Botão recolher — desktop only */}
        <div className={cn(
          "hidden md:flex px-2 pb-3 shrink-0",
          collapsed && "justify-center"
        )}>
          <div className="h-px bg-[#2e2b42] opacity-30 mb-3 w-full" />
        </div>
        <div className={cn(
          "hidden md:flex px-2 pb-4 shrink-0",
          collapsed && "justify-center"
        )}>
          <button
            onClick={onToggleCollapse}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl w-full",
              "text-[#3d3a55] hover:text-[#8a8375] hover:bg-[#1a1928]",
              "transition-all duration-200 text-[11px] font-sans",
              collapsed && "justify-center px-2 w-auto"
            )}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed
              ? <ChevronsRight className="w-3.5 h-3.5" />
              : <><ChevronsLeft className="w-3.5 h-3.5 shrink-0" /><span>Recolher</span></>
            }
          </button>
        </div>
      </aside>
    </>
  )
}
