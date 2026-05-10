"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, NotebookPen, Clock, Heart, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/biblia",     icon: BookOpen,     label: "Bíblia"     },
  { href: "/devocional", icon: NotebookPen,  label: "Devocional" },
  { href: "/plano",      icon: Clock,        label: "Plano"      },
  { href: "/oracoes",    icon: Heart,        label: "Orações"    },
]

interface BottomNavProps {
  onOpenSidebar: () => void
}

export function BottomNav({ onOpenSidebar }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav md:hidden flex items-center justify-around h-16 px-1 flex-shrink-0">
      {items.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors duration-200",
              active ? "text-[#c9a654]" : "text-[#3d3a55]"
            )}
          >
            <Icon className={cn("w-5 h-5", active && "drop-shadow-[0_0_6px_rgba(201,166,84,0.5)]")} />
            <span className="text-[8px] uppercase tracking-widest font-display">{label}</span>
          </Link>
        )
      })}
      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[#3d3a55] transition-colors duration-200 hover:text-[#8a8375]"
      >
        <MoreHorizontal className="w-5 h-5" />
        <span className="text-[8px] uppercase tracking-widest font-display">Mais</span>
      </button>
    </nav>
  )
}
