"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { BottomNav } from "@/components/layout/BottomNav"

interface AppShellProps {
  children: React.ReactNode
  userName?: string | null
  userImage?: string | null
}

export function AppShell({ children, userName, userImage }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const pathname = usePathname()

  useEffect(() => {
    const saved = localStorage.getItem("selah-theme")
    if (saved === "light") setTheme("light")
  }, [])

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark"
    const apply = () => {
      setTheme(next)
      localStorage.setItem("selah-theme", next)
      if (next === "light") {
        document.documentElement.setAttribute("data-theme", "light")
      } else {
        document.documentElement.removeAttribute("data-theme")
      }
    }
    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(apply)
    } else {
      apply()
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-glass-base relative">
      {/* Liquid glass ambient orbs */}
      <div className="liquid-orb-1" />
      <div className="liquid-orb-2" />
      <div className="liquid-orb-3" />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <Topbar
          userName={userName}
          userImage={userImage}
          theme={theme}
          onToggleSidebar={() => setSidebarOpen(s => !s)}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {/* Dashboard tem stagger próprio (candle-enter); todas as outras páginas usam animate-page-in */}
          <div key={pathname} className={cn("h-full", pathname !== "/dashboard" && "animate-page-in")}>
            {children}
          </div>
        </main>

        <BottomNav onOpenSidebar={() => setSidebarOpen(true)} />
      </div>
    </div>
  )
}
