import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { authConfig } from "@/lib/auth.config"

const credentialsSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
})

// Pre-computed dummy hash used to keep bcrypt timing constant when the e-mail
// does not exist — prevents user enumeration via response-time analysis.
// Generated once for the literal "dummy-password-never-matches".
const DUMMY_HASH = "$2b$12$Nc97nbCCAlXSfL9TtD7mie3WSFxGBUTw1zzl5JbZlQ6Lhm4rVYt3O"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email e Senha",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        })

        // Always run bcrypt.compare to equalize timing — if the user does not
        // exist we compare against a fixed dummy hash so the response time is
        // indistinguishable from a wrong-password attempt on a real account.
        const hash = user?.password ?? DUMMY_HASH
        const valid = await bcrypt.compare(parsed.data.password, hash)
        if (!user || !user.password || !valid) return null

        return { id: user.id, name: user.name, email: user.email, image: user.image }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account, profile }) {
      // Google OAuth first sign-in: account is only present on first auth
      // Must check this BEFORE user?.id because NextAuth also sets user for OAuth
      if (account?.provider === "google" && profile?.email) {
        try {
          const email = profile.email as string
          let dbUser = await db.user.findUnique({ where: { email } })
          if (!dbUser) {
            dbUser = await db.user.create({
              data: {
                email,
                name: (profile.name as string) ?? null,
                image: ((profile as Record<string, unknown>).picture as string) ?? null,
              },
            })
          }
          token.id = dbUser.id
          token.name = dbUser.name
          token.email = dbUser.email
          token.picture = dbUser.image
        } catch (err) {
          console.error("[auth] Google jwt error:", err)
        }
        return token
      }
      // Credentials login: authorize() already validated and returned DB user
      if (user?.id) {
        token.id = user.id
      }
      return token
    },
  },
})
