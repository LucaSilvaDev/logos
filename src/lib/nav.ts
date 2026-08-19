import {
  BookOpen, LayoutDashboard, NotebookPen, Search, ScanSearch,
  Clock, Church, Flame, Library, Heart, UserCircle, Brain, Map,
} from "lucide-react"

export const primaryNav = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "Início" },
  { href: "/biblia",     icon: BookOpen,         label: "Bíblia" },
  { href: "/plano",      icon: Clock,            label: "Plano" },
  { href: "/devocional", icon: NotebookPen,      label: "Devocional" },
  { href: "/estudo",     icon: Search,           label: "Estudo" },
] as const

export const moreNav = [
  { href: "/busca",       icon: ScanSearch,  label: "Busca" },
  { href: "/progresso",   icon: Map,         label: "Progresso" },
  { href: "/memorizar",   icon: Brain,       label: "Memorizar" },
  { href: "/oracoes",     icon: Heart,       label: "Orações" },
  { href: "/historia",    icon: Church,      label: "História" },
  { href: "/escatologia", icon: Flame,       label: "Escatologia" },
  { href: "/biblioteca",  icon: Library,     label: "Biblioteca" },
  { href: "/perfil",      icon: UserCircle,  label: "Perfil" },
] as const

export function isNavActive(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href)
}
