import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/layout/AppShell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/entrar")

  return (
    <AppShell
      userName={session.user?.name}
      userImage={session.user?.image}
    >
      {children}
    </AppShell>
  )
}
