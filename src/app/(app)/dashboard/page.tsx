import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getQuoteOfTheDay } from "@/lib/quotes"
import { getDailyVerse } from "@/lib/daily-verse"
import { PLAN_CONFIG } from "@/lib/reading-plan"
import Link from "next/link"
import {
  BookOpen, NotebookPen, Clock, Search,
  Flame, Church, Library, Heart, BookMarked
} from "lucide-react"
import { StatCounter } from "@/components/StatCounter"
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

  const verse = getDailyVerse()

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
    {/*
      animate-fade-in removido daqui: ele animava o bloco inteiro como um,
      o que conflitaria com o stagger individual dos elementos abaixo.
      Cada filho agora tem sua própria entrada com candle-enter + candle-delay-N.
    */}
    <div className="max-w-4xl mx-auto px-2 py-8 space-y-10">

      {/* Saudação — ordem ritualística: data primeiro, nome depois, linha por último */}
      <div className="space-y-1">
        {/* Elemento 1: data — entra primeiro, discreta, prepara o contexto */}
        <p className="candle-enter candle-delay-0 text-[#55524a] text-sm tracking-wider uppercase font-medium">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
        {/* Elemento 2: saudação — protagonista, chega com 180ms de pausa após a data */}
        <h1 className="candle-enter candle-delay-1 font-serif text-4xl text-[#e2d9c5] font-normal">
          {greeting()}, {session?.user?.name?.split(" ")[0]}
        </h1>
        {/* Elemento 3: linha dourada — lacre visual, aparece por último no bloco */}
        <div className="candle-enter candle-delay-2 h-px w-16 bg-[#c9a654] opacity-40 mt-3" />
      </div>

      {/* Versículo do Dia — elemento 4: desliza de baixo após a saudação se firmar */}
      <Link href="/biblia" className="candle-enter candle-delay-3 block card-soft relative pl-6 pr-4 py-5 group">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#c9a654] via-[#c9a654] to-transparent opacity-60 rounded-full" />
        <p className="font-display text-[9px] text-[#c9a654] uppercase tracking-[0.2em] mb-3 opacity-70">
          Versículo do Dia
        </p>
        <blockquote className="font-serif text-[1.05rem] text-[#c9c0a8] leading-relaxed italic mb-3 group-hover:text-[#e2d9c5] transition-colors">
          &ldquo;{verse.text}&rdquo;
        </blockquote>
        <p className="text-[#c9a654] text-sm font-medium">{verse.ref}</p>
      </Link>

      {/* Nuvem de Testemunhas — elemento 5: pausa maior, entra como eco do versículo */}
      <div className="candle-enter candle-delay-4 card-soft relative pl-6 pr-4 py-5">
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

      {/* Estatísticas animadas */}
      <div className="flex gap-8">
        <StatCounter label="Devocionais" value={devotionalCount} icon={NotebookPen} />
        <StatCounter label="Grifos"      value={highlightCount}  icon={BookMarked} />
        <StatCounter label="Notas"       value={studyCount}       icon={Search} />
        <StatCounter label="Orações"     value={prayerCount}      icon={Heart} />
      </div>

      {/* Módulos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5">
        {modules.map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 px-3 py-4 rounded-xl hover:bg-[linear-gradient(135deg,rgba(201,166,84,0.07),rgba(201,166,84,0.02))] transition-all duration-300"
          >
            <Icon className="w-4 h-4 text-[#3d3a55] group-hover:text-[#c9a654] transition-colors shrink-0" />
            <div className="min-w-0">
              <p className="text-[#8a8375] text-sm group-hover:text-[#c9c0a8] transition-colors leading-tight">{title}</p>
              <p className="text-[#3d3a55] text-[10px] mt-0.5 truncate">{desc}</p>
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
          <div className="divide-y divide-[#1e1c2e]">
            {recentDevotionals.map((d: { id: string; title: string; bibleRef: string | null; createdAt: Date }) => (
              <Link
                key={d.id}
                href={`/devocional/${d.id}`}
                className="group flex items-center justify-between px-2 py-3.5 hover:bg-[linear-gradient(90deg,rgba(201,166,84,0.04),transparent)] transition-all duration-300 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-[#c9a654] opacity-40 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-[#8a8375] text-sm group-hover:text-[#c9c0a8] transition-colors">{d.title}</p>
                    {d.bibleRef && <p className="text-[#3d3a55] text-xs mt-0.5 italic font-serif">{d.bibleRef}</p>}
                  </div>
                </div>
                <span className="text-[10px] text-[#2e2b42] flex-shrink-0 ml-4">
                  {format(new Date(d.createdAt), "d MMM", { locale: ptBR })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Confissão de Fé */}
      <div className="pt-4 border-t border-[#1e1c2e]">
        <p className="font-display text-[9px] text-[#2e2b42] uppercase tracking-[0.2em] mb-3">Confissão de Fé</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {["Reformado", "TULIP — 5 Pontos", "Pós-Tribulacionista", "Pré-Milenista Histórico", "Sola Scriptura", "Sola Fide", "Sola Gratia"].map((tag) => (
            <span key={tag} className="text-[11px] text-[#3d3a55] font-serif">
              {tag}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}
