import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getQuoteOfTheDay } from "@/lib/quotes"
import { PLAN_CONFIG } from "@/lib/reading-plan"
import Link from "next/link"
import {
  BookOpen, NotebookPen, Clock, Search,
  Flame, Church, Library, Heart, BookMarked
} from "lucide-react"
import { format } from "date-fns"
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

  const [devotionalCount, highlightCount, studyCount, prayerCount, profile] = await Promise.all([
    db.devotional.count({ where: { userId } }),
    db.highlight.count({ where: { userId } }),
    db.studyNote.count({ where: { userId } }),
    db.prayer.count({ where: { userId } }),
    db.userProfile.findUnique({ where: { userId } }),
  ])

  const recentDevotionals = await db.devotional.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, title: true, bibleRef: true, createdAt: true },
  })

  const modules = [
    { href: "/biblia",      icon: BookOpen,    title: "Bíblia",             desc: "Leitura e meditação" },
    { href: "/devocional",  icon: NotebookPen, title: "Devocional",         desc: `${devotionalCount} entrada${devotionalCount !== 1 ? "s" : ""}` },
    { href: "/plano",       icon: Clock,       title: "Plano de Leitura",   desc: profile?.readingPlanType ? (PLAN_CONFIG[profile.readingPlanType]?.label ?? profile.readingPlanType) : "Escolher plano" },
    { href: "/estudo",      icon: Search,      title: "Estudo",             desc: `${studyCount} nota${studyCount !== 1 ? "s" : ""}` },
    { href: "/oracoes",     icon: Heart,       title: "Orações",            desc: `${prayerCount} oração${prayerCount !== 1 ? "ões" : ""}` },
    { href: "/escatologia", icon: Flame,       title: "Escatologia",        desc: "Profecia bíblica" },
    { href: "/historia",    icon: Church,      title: "História da Igreja", desc: "33 d.C. → hoje" },
    { href: "/biblioteca",  icon: Library,     title: "Biblioteca",         desc: "TULIP · Westminster" },
  ]

  return (
    <div className="max-w-4xl mx-auto px-2 py-8 space-y-10 animate-fade-in">

      {/* Saudação */}
      <div className="space-y-1">
        <p className="text-[#55524a] text-sm tracking-wider uppercase font-medium">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
        <h1 className="font-serif text-4xl text-[#e2d9c5] font-normal">
          {greeting()}, {session?.user?.name?.split(" ")[0]}
        </h1>
        <div className="h-px w-16 bg-[#c9a654] opacity-40 mt-3" />
      </div>

      {/* Citação do Dia */}
      <div className="card-soft relative pl-6 pr-4 py-5">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#c9a654] via-[#c9a654] to-transparent opacity-60 rounded-full" />
        <p className="font-display text-[9px] text-[#c9a654] uppercase tracking-[0.2em] mb-3 opacity-70">
          Nuvem de Testemunhas
        </p>
        <blockquote className="font-serif text-[1.1rem] text-[#c9c0a8] leading-relaxed italic mb-3">
          &ldquo;{quote.content}&rdquo;
        </blockquote>
        <p className="text-[#c9a654] text-sm font-medium">{quote.author}</p>
        {quote.source && <p className="text-[#55524a] text-xs mt-0.5">{quote.source}</p>}
      </div>

      {/* Estatísticas — discretas */}
      <div className="flex gap-8">
        {[
          { label: "Devocionais", value: devotionalCount, icon: NotebookPen },
          { label: "Grifos",      value: highlightCount,  icon: BookMarked },
          { label: "Notas",       value: studyCount,       icon: Search },
          { label: "Orações",     value: prayerCount,      icon: Heart },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2.5">
            <Icon className="w-3.5 h-3.5 text-[#3d3a55]" />
            <div>
              <p className="text-xl font-semibold text-[#e2d9c5] leading-none">{value}</p>
              <p className="text-[10px] text-[#55524a] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Divisor */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[#2e2b42]" />
        <p className="font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.25em]">Módulos</p>
        <div className="flex-1 h-px bg-[#2e2b42]" />
      </div>

      {/* Módulos — grid arredondado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {modules.map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="group card-soft p-5 flex flex-col gap-3"
          >
            <Icon className="w-4 h-4 text-[#3d3a55] group-hover:text-[#c9a654] transition-colors" />
            <div>
              <p className="text-[#c9c0a8] text-sm font-medium group-hover:text-[#e2d9c5] transition-colors">{title}</p>
              <p className="text-[#55524a] text-xs mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Devocionais recentes */}
      {recentDevotionals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.2em]">Devocionais Recentes</p>
            <Link href="/devocional" className="text-xs text-[#c9a654] hover:opacity-80 transition-opacity">
              Ver todos
            </Link>
          </div>
          <div className="space-y-2">
            {recentDevotionals.map((d: { id: string; title: string; bibleRef: string | null; createdAt: Date }) => (
              <Link
                key={d.id}
                href={`/devocional/${d.id}`}
                className="card-soft flex items-center justify-between px-4 py-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-[#c9a654] opacity-40 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-[#c9c0a8] text-sm group-hover:text-[#e2d9c5] transition-colors">{d.title}</p>
                    {d.bibleRef && <p className="text-[#55524a] text-xs mt-0.5 italic font-serif">{d.bibleRef}</p>}
                  </div>
                </div>
                <span className="text-xs text-[#3d3a55] flex-shrink-0 ml-4">
                  {format(new Date(d.createdAt), "d MMM", { locale: ptBR })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posição Teológica */}
      <div className="pt-4 border-t border-[#2e2b42]">
        <p className="font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.2em] mb-3">Confissão de Fé</p>
        <div className="flex flex-wrap gap-2">
          {["Reformado", "TULIP — 5 Pontos", "Pós-Tribulacionista", "Pré-Milenista Histórico", "Sola Scriptura", "Sola Fide", "Sola Gratia"].map((tag) => (
            <span key={tag} className="px-2.5 py-1 text-[11px] rounded-xl border border-[#2e2b42] text-[#55524a] bg-[#1a1928]">
              {tag}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}
