import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const proxy = auth as any

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.png$).*)",
  ],
}
