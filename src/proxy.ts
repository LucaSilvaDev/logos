import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

// Next.js 16 renomeou "middleware.ts" para "proxy.ts" (roda em Node.js
// runtime, não mais Edge). Usa authConfig (sem Prisma/bcrypt) para decisões
// rápidas de redirecionamento — a lógica de gate fica em auth.config.ts
// (callbacks.authorized), que já existia mas nunca era consumida.
const { auth } = NextAuth(authConfig)

export const proxy = auth

// Exclui /api, os internos do Next e qualquer arquivo estático por extensão
// (antes só .png era excluído — qualquer outro asset em /public, como as
// fotos da landing em .jpg, o vídeo da home em .mp4 ou o service worker,
// caía no gate de auth e voltava um redirect em vez do arquivo).
// O matcher precisa ser uma string literal estática (Next.js analisa em
// build-time), então a lista de extensões fica inline em vez de interpolada.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|mjs|json|xml|txt|woff|woff2|ttf|mp4|webm|map)$).*)",
  ],
}
