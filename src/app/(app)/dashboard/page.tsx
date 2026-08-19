import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getQuoteOfTheDay } from "@/lib/quotes"
import { getDailyVerse } from "@/lib/daily-verse"
import { PLAN_CONFIG, BOOK_CHAPTERS } from "@/lib/reading-plan"
import Link from "next/link"
import {
  Search, Heart, PenLine, Brain, Flame, BookOpen,
} from "lucide-react"
import { ContinueReading } from "@/components/ContinueReading"
import { format, subDays, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"

function greeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return "Bom dia"
  if (h >= 12 && h < 18) return "Boa tarde"
  return "Boa noite"
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!
  const quote = getQuoteOfTheDay()
  const verse = getDailyVerse()

  const [highlightCount, studyCount, profile, planProgress, chapterReads] = await Promise.all([
    db.highlight.count({ where: { userId } }),
    db.studyNote.count({ where: { userId } }),
    db.userProfile.findUnique({ where: { userId } }),
    db.readingPlanProgress.findMany({
      where: { userId },
      select: { completedAt: true },
    }),
    db.chapterRead.findMany({
      where: { userId },
      select: { book: true, chapter: true, readAt: true },
    }),
  ])

  const allActivityDays = new Set<number>([
    ...planProgress.map(p => startOfDay(p.completedAt).getTime()),
    ...chapterReads.map(r => startOfDay(r.readAt).getTime()),
  ])
  let streak = 0
  let cursor = startOfDay(new Date())
  if (!allActivityDays.has(cursor.getTime())) cursor = subDays(cursor, 1)
  while (allActivityDays.has(cursor.getTime())) {
    streak++
    cursor = subDays(cursor, 1)
  }

  const totalBibleChapters = Object.values(BOOK_CHAPTERS).reduce((a, b) => a + b, 0)
  const totalChaptersRead  = chapterReads.length
  const biblePercent       = totalBibleChapters > 0
    ? Math.round((totalChaptersRead / totalBibleChapters) * 1000) / 10
    : 0

  const totalPlanDays = profile?.readingPlanType && PLAN_CONFIG[profile.readingPlanType]
    ? PLAN_CONFIG[profile.readingPlanType].days
    : null
  const completedDays = planProgress.length

  const recentDevotionals = await db.devotional.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, title: true, bibleRef: true, createdAt: true },
  })

  const firstName = session?.user?.name?.split(" ")[0] ?? ""

  const quickActions = [
    { href: "/biblia",          icon: BookOpen, label: "Ler" },
    { href: "/devocional/novo", icon: PenLine,  label: "Devocional" },
    { href: "/oracoes/nova",    icon: Heart,    label: "Orar" },
    { href: "/memorizar",       icon: Brain,    label: "Memorizar" },
    { href: "/estudo",          icon: Search,   label: "Estudar" },
  ]

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-14 space-y-12">

      <header className="space-y-5">
        <p className="home-kicker animate-fade-up">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
        <h1 className="home-title animate-fade-up delay-60">
          {greeting()}, {firstName}.
        </h1>
        <div className="flex flex-wrap gap-2 animate-fade-up delay-140">
          {quickActions.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="pill-action">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </header>

      <ContinueReading />

      <section className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-fade-up delay-140">
        <Link href="/biblia" className="quote-card quote-card-accent md:col-span-3 group">
          <p className="home-kicker mb-4">Versículo do dia</p>
          <blockquote className="font-serif text-[1.35rem] leading-snug italic text-inherit">
            &ldquo;{verse.text}&rdquo;
          </blockquote>
          <p className="mt-5 text-sm font-medium">{verse.ref} →</p>
        </Link>

        <div className="quote-card md:col-span-2">
          <p className="home-kicker mb-4">Nuvem de testemunhas</p>
          <blockquote className="font-serif text-[1.05rem] leading-relaxed italic opacity-90">
            &ldquo;{quote.content}&rdquo;
          </blockquote>
          <p className="mt-4 text-sm">{quote.author}</p>
          {quote.source && <p className="text-xs opacity-50 mt-1">{quote.source}</p>}
        </div>
      </section>

      <section className="animate-fade-up delay-220">
        <p className="home-kicker mb-6">01 · Progresso</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <Link href="/progresso" className="group">
            <p className="home-stat">{biblePercent}%</p>
            <p className="home-stat-label">Bíblia · {totalChaptersRead} cap.</p>
          </Link>
          <div>
            <p className="home-stat flex items-center gap-2">
              {streak}
              {streak >= 3 && <Flame className="w-4 h-4 text-[#c9a654]" />}
            </p>
            <p className="home-stat-label">dias seguidos</p>
          </div>
          {totalPlanDays ? (
            <Link href="/plano" className="group">
              <p className="home-stat">{completedDays}/{totalPlanDays}</p>
              <p className="home-stat-label">plano</p>
            </Link>
          ) : (
            <Link href="/plano" className="group">
              <p className="home-stat">—</p>
              <p className="home-stat-label">escolher plano →</p>
            </Link>
          )}
          <div>
            <p className="home-stat">{highlightCount}</p>
            <p className="home-stat-label">grifos · {studyCount} notas</p>
          </div>
        </div>
      </section>

      {recentDevotionals.length > 0 && (
        <section className="animate-fade-up delay-220">
          <div className="flex items-baseline justify-between mb-4">
            <p className="home-kicker">02 · Devocionais</p>
            <Link href="/devocional" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-[rgba(26,22,20,0.1)]">
            {recentDevotionals.map((d) => (
              <Link
                key={d.id}
                href={`/devocional/${d.id}`}
                className="flex items-baseline justify-between gap-4 py-4 group"
              >
                <div>
                  <p className="text-[15px] group-hover:opacity-70 transition-opacity">{d.title}</p>
                  {d.bibleRef && (
                    <p className="font-serif italic text-sm opacity-50 mt-0.5">{d.bibleRef}</p>
                  )}
                </div>
                <span className="text-xs opacity-40 shrink-0">
                  {format(new Date(d.createdAt), "d MMM", { locale: ptBR })}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
