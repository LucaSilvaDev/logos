import { auth } from "@/lib/auth"
import { PerfilClient } from "./PerfilClient"

export default async function PerfilPage() {
  const session = await auth()
  return (
    <PerfilClient
      userName={session?.user?.name}
      userEmail={session?.user?.email}
      userImage={session?.user?.image}
    />
  )
}
