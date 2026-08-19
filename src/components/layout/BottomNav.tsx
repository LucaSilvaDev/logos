"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { primaryNav, isNavActive } from "@/lib/nav"

interface BottomNavProps {
  moreOpen: boolean
  onToggleMore: () => void
}

export function BottomNav({ moreOpen, onToggleMore }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav" aria-label="Principal">
      {primaryNav.slice(0, 4).map(({ href, icon: Icon, label }) => {
        const active = isNavActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            className={cn("bottom-nav-item", active && "bottom-nav-item-active")}
          >
            <Icon className="w-5 h-5" strokeWidth={1.75} />
            <span>{label}</span>
          </Link>
        )
      })}

      <button
        type="button"
        onClick={onToggleMore}
        aria-expanded={moreOpen}
        className={cn("bottom-nav-item", moreOpen && "bottom-nav-item-active")}
      >
        <MoreHorizontal className="w-5 h-5" strokeWidth={1.75} />
        <span>Mais</span>
      </button>
    </nav>
  )
}
