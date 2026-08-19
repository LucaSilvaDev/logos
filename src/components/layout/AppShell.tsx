"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { AppNav } from "@/components/layout/AppNav"
import { BottomNav } from "@/components/layout/BottomNav"

interface AppShellProps {
  children: React.ReactNode
  userName?: string | null
  userImage?: string | null
}

export function AppShell({ children, userName, userImage }: AppShellProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("light")
  const pathname = usePathname()

  const mainRef = useRef<HTMLElement>(null)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("selah-theme")
    if (savedTheme === "dark") {
      setTheme("dark")
      document.documentElement.removeAttribute("data-theme")
    } else {
      setTheme("light")
      document.documentElement.setAttribute("data-theme", "light")
    }
  }, [])

  useEffect(() => {
    document.body.classList.remove("nav-hidden")
    lastScrollY.current = 0
    setMoreOpen(false)
  }, [pathname])

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    function onScroll() {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        if (!el) { ticking.current = false; return }
        const currentY = el.scrollTop
        const delta = currentY - lastScrollY.current

        if (Math.abs(delta) > 8) {
          if (delta > 0 && currentY > 60) {
            document.body.classList.add("nav-hidden")
            setMoreOpen(false)
          } else {
            document.body.classList.remove("nav-hidden")
          }
          lastScrollY.current = currentY
        }
        ticking.current = false
      })
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
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
      <div className="liquid-orb-1" />
      <div className="liquid-orb-2" />
      <div className="liquid-orb-3" />

      <AppNav
        userName={userName}
        userImage={userImage}
        theme={theme}
        moreOpen={moreOpen}
        onToggleMore={() => setMoreOpen(v => !v)}
        onCloseMore={() => setMoreOpen(false)}
        onToggleTheme={toggleTheme}
      />

      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8"
        >
          <div key={pathname} className="h-full animate-page-in">
            {children}
          </div>
        </main>

        <BottomNav
          moreOpen={moreOpen}
          onToggleMore={() => setMoreOpen(v => !v)}
        />
      </div>
    </div>
  )
}
