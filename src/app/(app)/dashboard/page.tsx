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
    <div className="max-w-5xl mx-auto px-5 py-10 md:py-16 space-y-16">

      <header className="space-y-6 max-w-2xl">
        <div>
          <h1 className="home-title animate-fade-up">
            {greeting()}, {firstName}.
          </h1>
          <p className="page-desc animate-fade-up delay-60">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 stagger-in">
          {quickActions.map(({ href, icon: Icon, label }, i) => (
            <Link
              key={href}
              href={href}
              className={i === 0 ? "pill-action pill-action-fill" : "pill-action"}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </header>

      <ContinueReading />

      <section className="grid grid-cols-1 md:grid-cols-5 gap-4 stagger-in">
        <Link href="/biblia" className="quote-card quote-card-accent md:col-span-3 group">
          <blockquote className="font-serif text-[1.5rem] leading-snug italic">
            &ldquo;{verse.text}&rdquo;
          </blockquote>
          <p className="mt-5 text-[16px]">{verse.ref} →</p>
        </Link>

        <div className="quote-card md:col-span-2">
          <blockquote className="text-[18px] leading-relaxed">
            &ldquo;{quote.content}&rdquo;
          </blockquote>
          <p className="mt-4 text-[15px]">{quote.author}</p>
          {quote.source && <p className="quote-cite mt-1">{quote.source}</p>}
        </div>
      </section>

      <section className="animate-fade-up delay-220">
        <h2 className="section-title mb-6">Progresso</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-in">
          <Link href="/progresso" className="artifact-card">
            <p className="home-stat">{biblePercent}%</p>
            <p className="home-stat-label">Bíblia · {totalChaptersRead} cap.</p>
          </Link>
          <div className="artifact-card">
            <p className="home-stat flex items-center gap-2">
              {streak}
              {streak >= 3 && <Flame className="w-4 h-4" />}
            </p>
            <p className="home-stat-label">dias seguidos</p>
          </div>
          {totalPlanDays ? (
            <Link href="/plano" className="artifact-card">
              <p className="home-stat">{completedDays}/{totalPlanDays}</p>
              <p className="home-stat-label">plano</p>
            </Link>
          ) : (
            <Link href="/plano" className="artifact-card">
              <p className="home-stat">—</p>
              <p className="home-stat-label">escolher plano →</p>
            </Link>
          )}
          <div className="artifact-card">
            <p className="home-stat">{highlightCount}</p>
            <p className="home-stat-label">grifos · {studyCount} notas</p>
          </div>
        </div>
      </section>

      {recentDevotionals.length > 0 && (
        <section className="animate-fade-up delay-220">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="section-title">Devocionais</h2>
            <Link href="/devocional" className="text-link">
              Ver todos →
            </Link>
          </div>
          <div className="grid gap-3 stagger-in">
            {recentDevotionals.map((d) => (
              <Link
                key={d.id}
                href={`/devocional/${d.id}`}
                className="mist-row"
              >
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
    </div>
  )
}
