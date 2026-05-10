import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/layout/AppShell"

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
