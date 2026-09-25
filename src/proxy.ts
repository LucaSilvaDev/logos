import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

// Next.js 16 renomeou "middleware.ts" para "proxy.ts" (roda em Node.js
// runtime, não mais Edge). Usa authConfig (sem Prisma/bcrypt) para decisões
// rápidas de redirecionamento — a lógica de gate fica em auth.config.ts
// (callbacks.authorized), que já existia mas nunca era consumida.
const { auth } = NextAuth(authConfig)

export const proxy = auth

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)"],
}
