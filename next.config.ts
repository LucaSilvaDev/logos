import type { NextConfig } from "next"
import path from "path"

// CSP enforcing. Mantém as mesmas diretivas que rodaram em Report-Only antes;
// monitore os headers de resposta em produção após o deploy para garantir que
// nada de legítimo está sendo bloqueado (nenhum script externo é carregado
// hoje além do inline estático em layout.tsx, coberto por 'unsafe-inline').
// Em dev, o React usa eval() para reconstruir stack traces — 'unsafe-eval'
// nunca é necessário em produção (React não usa eval() fora de dev).
const isDev = process.env.NODE_ENV !== "production"
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://db.onlinewebfonts.com https://fonts.cdnfonts.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://db.onlinewebfonts.com https://fonts.cdnfonts.com https://fonts.cdnfonts.net",
  "media-src 'self' blob: https://d8j0ntlcm91z4.cloudfront.net",
  "connect-src 'self' https://www.bibliaonline.com.br https://platform.youversion.com https://d8j0ntlcm91z4.cloudfront.net",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ")

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Content-Security-Policy",   value: cspDirectives },
]

const nextConfig: NextConfig = {
  // Há um package-lock.json em C:\Biblia (fora deste projeto) que faz o
  // Turbopack inferir a raiz do workspace errada e falhar ao resolver
  // node_modules em dev. Fixa a raiz explicitamente neste diretório.
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
    ]
  },
}

export default nextConfig
