import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

// Config segura para Edge Runtime (sem Node.js APIs, sem banco de dados)
export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/entrar",
    error: "/entrar",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      // A validação real acontece em auth.ts (Node.js runtime)
      async authorize() {
        return null
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const publicPaths = ["/entrar", "/cadastro"]
      const isPublic = publicPaths.some((p) => nextUrl.pathname.startsWith(p))

      if (!isLoggedIn && !isPublic) return false
      if (isLoggedIn && isPublic) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string
      return session
    },
  },
  session: { strategy: "jwt" },
}
