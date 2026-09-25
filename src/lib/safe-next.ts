const FALLBACK = "/biblia"

export function safeAppPath(value: string | null | undefined) {
  if (!value) return FALLBACK
  try {
    const url = new URL(value, "https://selah.local")
    if (url.pathname.startsWith("//") || url.username || url.password) return FALLBACK
    if (!url.pathname.startsWith("/")) return FALLBACK
    const blocked = ["/entrar", "/cadastro", "/esqueci-senha", "/redefinir-senha"]
    if (blocked.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) return FALLBACK
    return `${url.pathname}${url.search}`
  } catch {
    return FALLBACK
  }
}
