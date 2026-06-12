"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, BookOpen, NotebookPen, Clock, MoreHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "Início"    },
  { href: "/biblia",     icon: BookOpen,         label: "Bíblia"    },
  { href: "/plano",      icon: Clock,            label: "Plano"     },
  { href: "/devocional", icon: NotebookPen,       label: "Devocional"},
]

interface BottomNavProps {
  onOpenSidebar: () => void
}

export function BottomNav({ onOpenSidebar }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className="bottom-nav md:hidden"
      style={{
        position: "fixed",
        bottom: "calc(0.25rem + env(safe-area-inset-bottom))",
        left: "1rem",
        right: "1rem",
        zIndex: 50,
        height: "60px",
        alignItems: "center",
        justifyContent: "space-around",
        borderRadius: "20px",
        background: "rgba(22,22,24,0.82)",
        backdropFilter: "blur(40px) saturate(1.8)",
        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.06) inset",
      }}
    >
      {items.map(({ href, icon: Icon, label }) => {
        const active = href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-[3px] px-3 py-1.5 rounded-2xl transition-all duration-200",
              active
                ? "text-[#c9a654]"
                : "text-[#4a4650]"
            )}
            style={active ? {
              background: "rgba(201,166,84,0.1)",
            } : undefined}
          >
            <Icon className={cn(
              "w-[22px] h-[22px] transition-all duration-200",
              active && "drop-shadow-[0_0_8px_rgba(201,166,84,0.6)]"
            )} />
            <span className={cn(
              "text-[8px] uppercase tracking-widest font-display transition-all duration-200",
              active ? "opacity-100" : "opacity-50"
            )}>
              {label}
            </span>
          </Link>
        )
      })}

      {/* Mais — abre sidebar com todos os itens */}
      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center gap-[3px] px-3 py-1.5 rounded-2xl text-[#4a4650] transition-all duration-200 active:bg-white/5"
      >
        <MoreHorizontal className="w-[22px] h-[22px]" />
        <span className="text-[8px] uppercase tracking-widest font-display opacity-50">Mais</span>
      </button>
    </nav>
  )
}
