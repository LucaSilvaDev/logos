"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BookOpen, LayoutDashboard, NotebookPen, Search,
  Clock, Church, Flame, Library, Heart, X
} from "lucide-react"

const navItems = [
  { href: "/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
  { href: "/biblia",      icon: BookOpen,         label: "Bíblia" },
  { href: "/plano",       icon: Clock,            label: "Plano de Leitura" },
  { href: "/devocional",  icon: NotebookPen,      label: "Devocional" },
  { href: "/estudo",      icon: Search,           label: "Estudo" },
  { href: "/oracoes",     icon: Heart,            label: "Orações" },
  { href: "/historia",    icon: Church,           label: "História" },
  { href: "/escatologia", icon: Flame,            label: "Escatologia" },
  { href: "/biblioteca",  icon: Library,          label: "Biblioteca" },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          style={{ animation: "fadeIn 0.2s ease" }}
        />
      )}

      {/* Floating panel */}
      <aside
        className={cn(
          "sidebar fixed inset-y-0 left-0 z-40 w-64 flex flex-col rounded-r-3xl",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#c9a654]" />
            <div>
              <p className="font-display text-[#e2d9c5] text-sm tracking-widest uppercase">Selah</p>
              <p className="text-[#55524a] text-[9px] tracking-wider mt-0.5 uppercase font-sans">Pausa · Medita · Reflete</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#3d3a55] hover:text-[#8a8375] transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Separator */}
        <div className="mx-6 h-px bg-[#2e2b42] opacity-40" />

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <p className="px-3 text-[9px] text-[#3d3a55] uppercase tracking-widest font-sans mb-3">Navegação</p>
          <div className="space-y-0.5">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/")
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
                    "w-4 h-4 flex-shrink-0 transition-colors duration-200",
                    active ? "text-[#c9a654]" : "text-[#3d3a55] group-hover:text-[#8a8375]"
                  )} />
                  <span className={cn("font-serif", active && "font-medium")}>{label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c9a654] opacity-70 flex-shrink-0" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-6 py-5">
          <div className="h-px bg-[#2e2b42] opacity-40 mb-4" />
          <p className="text-[#3d3a55] text-[9px] uppercase tracking-widest font-sans mb-2">Confissão</p>
          <p className="text-[#55524a] text-[10px] leading-relaxed font-serif">
            Reformado · TULIP<br />
            <span className="text-[#c9a654] opacity-60">Pós-Trib · Pré-Mil Histórico</span>
          </p>
        </div>
      </aside>
    </>
  )
}
