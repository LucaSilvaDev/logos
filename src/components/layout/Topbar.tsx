"use client"

import { signOut } from "next-auth/react"
import { LogOut, User, Menu, Sun, Moon } from "lucide-react"

interface TopbarProps {
  userName?: string | null
  userImage?: string | null
  theme: "dark" | "light"
  onToggleSidebar: () => void
  onToggleTheme: () => void
}

export function Topbar({ userName, userImage, theme, onToggleSidebar, onToggleTheme }: TopbarProps) {
  return (
    <header className="topbar z-20 h-14 flex items-center px-5 flex-shrink-0">
      <button
        onClick={onToggleSidebar}
        className="text-[#3d3a55] hover:text-[#c9a654] transition-colors duration-200 p-1.5 rounded-lg hover:bg-[#1a1928] mr-3"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="text-[#3d3a55] hover:text-[#c9a654] transition-colors duration-200 p-1.5 rounded-lg hover:bg-[#1a1928]"
          aria-label={theme === "dark" ? "Tema claro" : "Tema escuro"}
          title={theme === "dark" ? "Tema claro" : "Tema escuro"}
        >
          {theme === "dark"
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        <div className="w-px h-4 bg-[#2e2b42]" />

        {userImage ? (
          <img src={userImage} alt="" className="w-7 h-7 rounded-full ring-1 ring-[#2e2b42]" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#211f31] border border-[#2e2b42] flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-[#55524a]" />
          </div>
        )}
        <span className="text-[13px] text-[#55524a] font-serif hidden sm:block">{userName}</span>
        <div className="w-px h-4 bg-[#2e2b42]" />
        <button
          onClick={() => signOut({ callbackUrl: "/entrar" })}
          className="text-[#3d3a55] hover:text-[#8a8375] transition-colors duration-200"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
