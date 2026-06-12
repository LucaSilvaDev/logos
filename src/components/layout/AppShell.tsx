"use client"

import { useState, useEffect, useRef } from "react"
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const pathname = usePathname()

  // Tracks the user's explicit collapse preference before entering a reading route
  const savedBeforeReadRef = useRef<boolean | null>(null)
  // Always reflects latest sidebarCollapsed without stale closure issues
  const collapsedRef = useRef(sidebarCollapsed)
  collapsedRef.current = sidebarCollapsed

  useEffect(() => {
    const savedTheme = localStorage.getItem("selah-theme")
    if (savedTheme === "light") setTheme("light")
    const savedCollapsed = localStorage.getItem("selah-sidebar-collapsed")
    if (savedCollapsed === "1") setSidebarCollapsed(true)
  }, [])

  // Auto-collapse on reading routes (/biblia, /memorizar); restore on exit
  useEffect(() => {
    const isReadingRoute = pathname.startsWith("/biblia") || pathname.startsWith("/memorizar")
    if (isReadingRoute) {
      if (savedBeforeReadRef.current === null) {
        savedBeforeReadRef.current = collapsedRef.current
        setSidebarCollapsed(true)
      }
    } else {
      if (savedBeforeReadRef.current !== null) {
        const prev = savedBeforeReadRef.current
        savedBeforeReadRef.current = null
        setSidebarCollapsed(prev)
      }
    }
  }, [pathname])

  function toggleCollapse() {
    const next = !sidebarCollapsed
    setSidebarCollapsed(next)
    localStorage.setItem("selah-sidebar-collapsed", next ? "1" : "0")
    // If user manually toggles while on a reading route, treat that as the new baseline
    if (savedBeforeReadRef.current !== null) {
      savedBeforeReadRef.current = next
    }
  }

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

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <Topbar
          userName={userName}
          userImage={userImage}
          theme={theme}
          onToggleSidebar={() => setSidebarOpen(s => !s)}
          onToggleTheme={toggleTheme}
        />

        {/* pb accounts for floating nav height (60px) + gap (14px) + safe area */}
        <main className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
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
