import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getDailyVerse } from "@/lib/daily-verse"
import Link from "next/link"
import { ContinueReading } from "@/components/ContinueReading"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!
  const verse = getDailyVerse()
  const firstName = session?.user?.name?.split(" ")[0] ?? ""

  const recentDevotionals = await db.devotional.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, title: true, bibleRef: true, createdAt: true },
  })

  return (
    <div className="site-home">
      <header className="site-home-intro">
        <p className="page-desc">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
        <h1 className="home-title">
          {firstName ? `${firstName}, a leitura continua.` : "A leitura continua."}
        </h1>
      </header>

      <ContinueReading />

      <section className="site-home-verse">
        <p className="site-kicker">Palavra de hoje</p>
        <Link href="/biblia" className="site-verse">
          <blockquote>
            {verse.text}
          </blockquote>
          <p>{verse.ref}</p>
        </Link>
      </section>

      {recentDevotionals.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="section-title">Seus escritos</h2>
            <Link href="/devocional" className="text-link">Todos →</Link>
          </div>
          <div className="grid gap-1">
            {recentDevotionals.map((d) => (
              <Link key={d.id} href={`/devocional/${d.id}`} className="mist-row">
                <div>
                  <p className="text-[17px]">{d.title}</p>
                  {d.bibleRef && (
                    <p className="font-serif italic text-[15px] text-[#777b86] mt-0.5">{d.bibleRef}</p>
                  )}
                </div>
                <span className="text-[14px] text-[#979799] shrink-0">
                  {format(new Date(d.createdAt), "d MMM", { locale: ptBR })}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <nav className="site-home-links" aria-label="Outras páginas">
        <Link href="/devocional">Devocional</Link>
        <Link href="/estudo">Estudo</Link>
        <Link href="/plano">Plano de leitura</Link>
        <Link href="/progresso">O que já li</Link>
      </nav>
    </div>
  )
}
