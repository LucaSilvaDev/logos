"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"

interface AppShellProps {
  children: React.ReactNode
  userName?: string | null
  userImage?: string | null
}

export function AppShell({ children, userName, userImage }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    const saved = localStorage.getItem("selah-theme")
    if (saved === "light") setTheme("light")
  }, [])

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("selah-theme", next)
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light")
    } else {
      document.documentElement.removeAttribute("data-theme")
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-glass-base">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col h-full">
        <Topbar
          userName={userName}
          userImage={userImage}
          theme={theme}
          onToggleSidebar={() => setSidebarOpen(s => !s)}
          onToggleTheme={toggleTheme}
        />
        <main className="flex-1 overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
