import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const PROPHETIC_BOOKS = [
  { book: "Isaías",          totalChapters: 66, propheticChapters: [6,7,9,11,13,14,24,25,26,27,34,35,40,42,43,44,45,46,47,48,49,50,51,52,53,54,55,60,61,62,63,64,65,66] },
  { book: "Jeremias",        totalChapters: 52, propheticChapters: [23,25,30,31,32,33,46,47,48,49,50,51] },
  { book: "Ezequiel",        totalChapters: 48, propheticChapters: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,36,37,38,39,40,41,42,43,44,45,46,47,48] },
  { book: "Daniel",          totalChapters: 12, propheticChapters: [2,7,8,9,10,11,12] },
  { book: "Oséias",          totalChapters: 14, propheticChapters: [1,2,3,6,14] },
  { book: "Joel",            totalChapters: 3,  propheticChapters: [1,2,3] },
  { book: "Amós",            totalChapters: 9,  propheticChapters: [5,9] },
  { book: "Miquéias",        totalChapters: 7,  propheticChapters: [4,5,7] },
  { book: "Zacarias",        totalChapters: 14, propheticChapters: [1,2,3,4,5,6,7,8,9,10,11,12,13,14] },
  { book: "Malaquias",       totalChapters: 4,  propheticChapters: [3,4] },
  { book: "Mateus",          totalChapters: 28, propheticChapters: [24,25] },
  { book: "Marcos",          totalChapters: 16, propheticChapters: [13] },
  { book: "Lucas",           totalChapters: 24, propheticChapters: [17,21] },
  { book: "João",            totalChapters: 21, propheticChapters: [14,15,16] },
  { book: "Atos",            totalChapters: 28, propheticChapters: [2] },
  { book: "Romanos",         totalChapters: 16, propheticChapters: [8,9,10,11] },
  { book: "1 Coríntios",     totalChapters: 16, propheticChapters: [15] },
  { book: "1 Tessalonicenses", totalChapters: 5, propheticChapters: [4,5] },
  { book: "2 Tessalonicenses", totalChapters: 3, propheticChapters: [1,2] },
  { book: "2 Pedro",         totalChapters: 3,  propheticChapters: [3] },
  { book: "Apocalipse",      totalChapters: 22, propheticChapters: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22] },
]

const TIMELINE_EVENTS = [
  { phase: "Presente", title: "Era da Igreja",         desc: "Período entre as duas vindas de Cristo. Missão mundial, sofrimento e perseverança dos santos." },
  { phase: "Futuro",   title: "Grande Tribulação",     desc: "Posição Pós-Trib: a Igreja permanece e é purificada. Anti-Cristo reina brevemente por 3½ anos." },
  { phase: "Futuro",   title: "Segunda Vinda de Cristo",desc: "Cristo retorna nas nuvens com poder e glória. Ressurreição dos mortos. Arrebatamento (Pós-Trib)." },
  { phase: "Futuro",   title: "Milênio (1.000 anos)",  desc: "Reino milenial literal de Cristo na terra (Pré-Mil Histórico). Satanás acorrentado. Paz e justiça." },
  { phase: "Futuro",   title: "Julgamento Final",      desc: "Libertação final de Satanás. Grande Trono Branco. Ressurreição dos ímpios. Julgamento eterno." },
  { phase: "Eterno",   title: "Nova Criação",          desc: "Novos céus e nova terra. Nova Jerusalém. Deus habita com os Seus para sempre. Shalom eterno." },
]

const POSITION_NOTES = [
  { label: "Pós-Tribulacionista",    desc: "A Igreja passa pela tribulação e é arrebatada ao final, quando Cristo retorna." },
  { label: "Pré-Milenista Histórico",desc: "Cristo retorna antes de um reino literal de 1.000 anos na terra." },
  { label: "Anti-Pré-Tribulacionismo",desc: "Rejeitamos o arrebatamento secreto como leitura inconsistente com as Escrituras." },
]

export default async function EscatologiaPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const notes = await db.eschatologyNote.findMany({
    where: { userId },
    select: { book: true, chapter: true, studiedAt: true },
  })

  const studiedSet = new Set(notes.map((n: { book: string; chapter: number }) => `${n.book}-${n.chapter}`))
  const totalProphetic = PROPHETIC_BOOKS.reduce((sum, b) => sum + b.propheticChapters.length, 0)
  const studied = notes.length
  const pct = Math.round((studied / totalProphetic) * 100)

  return (
    <div className="max-w-3xl mx-auto px-2 py-8 space-y-8">

      <div className="flex items-end justify-between">
        <div>
          <p className="candle-enter candle-delay-0 font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em] mb-1">Profecia Bíblica</p>
          <h1 className="candle-enter candle-delay-1 font-serif text-3xl text-[#e2d9c5] font-normal">Escatologia</h1>
          <p className="candle-enter candle-delay-2 text-[#55524a] text-xs mt-1">Relógio Profético · {totalProphetic} capítulos</p>
        </div>
        <div className="candle-enter candle-delay-2 text-right">
          <p className="font-serif text-3xl text-[#e2d9c5]">{pct}<span className="text-base text-[#55524a]">%</span></p>
          <p className="text-[#3d3a55] text-[10px] uppercase tracking-wider font-display">{studied}/{totalProphetic}</p>
        </div>
      </div>

      <div className="candle-enter candle-delay-2 h-px bg-[#2e2b42]" />

      {/* Barra de progresso */}
      <div className="candle-enter candle-delay-3 space-y-2">
        <div className="flex justify-between text-[10px] text-[#3d3a55]">
          <span className="font-display uppercase tracking-wider">Capítulos estudados</span>
          <span>{studied} / {totalProphetic}</span>
        </div>
        <div className="h-px w-full bg-[#2e2b42] relative">
          <div className="absolute left-0 top-0 h-full bg-[#c9a654] transition-all duration-700"
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Posição teológica */}
      <section className="space-y-3">
        <p className="candle-enter font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.25em]"
          style={{ animationDelay: "400ms" }}>Posição Escatológica</p>
        <div className="space-y-2">
          {POSITION_NOTES.map((p, i) => (
            <div key={p.label} className="candle-flame card-soft px-4 py-3"
              style={{ animationDelay: `${450 + i * 80}ms` }}>
              <p className="font-serif text-[#c9c0a8] text-sm mb-0.5">{p.label}</p>
              <p className="text-[#55524a] text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline escatológica */}
      <section className="space-y-3">
        <p className="candle-enter font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.25em]"
          style={{ animationDelay: "700ms" }}>Timeline Profética</p>
        <div className="relative">
          <div className="absolute left-[68px] top-0 bottom-0 w-px bg-[#2e2b42]" />
          {TIMELINE_EVENTS.map((e, i) => (
            <div key={i} className="candle-flame flex gap-4 mb-5"
              style={{ animationDelay: `${750 + i * 70}ms` }}>
              <div className="w-16 text-right pt-0.5 flex-shrink-0">
                <span className={cn("text-[9px] font-display uppercase tracking-wider",
                  e.phase === "Eterno" ? "text-[#c9a654] opacity-60" :
                  e.phase === "Presente" ? "text-[#5a9e72] opacity-60" :
                  "text-[#55524a]"
                )}>
                  {e.phase}
                </span>
              </div>
              <div className="w-2 h-2 rounded-full border border-[#3d3a55] bg-[#12111e] flex-shrink-0 mt-1.5 relative z-10" />
              <div className="flex-1">
                <p className="font-serif text-[#c9c0a8] text-sm mb-0.5">{e.title}</p>
                <p className="text-[#55524a] text-xs leading-relaxed">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Capítulos proféticos */}
      <section className="space-y-4">
        <p className="candle-enter font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.25em]"
          style={{ animationDelay: "1200ms" }}>Capítulos Proféticos</p>
        <div className="space-y-5">
          {PROPHETIC_BOOKS.map((pb, bIdx) => {
            const studiedChapters = pb.propheticChapters.filter(c => studiedSet.has(`${pb.book}-${c}`))
            const allDone = studiedChapters.length === pb.propheticChapters.length
            return (
              <div key={pb.book} className="candle-enter"
                style={{ animationDelay: `${1260 + bIdx * 50}ms` }}>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3 h-3 text-[#3d3a55]" />
                    <h3 className="font-serif text-[#8a8375] text-sm">{pb.book}</h3>
                  </div>
                  <span className={cn("text-[10px]", allDone ? "text-[#c9a654]" : "text-[#3d3a55]")}>
                    {studiedChapters.length}/{pb.propheticChapters.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pb.propheticChapters.map(ch => {
                    const key = `${pb.book}-${ch}`
                    const done = studiedSet.has(key)
                    return (
                      <Link key={ch} href={`/escatologia/${encodeURIComponent(pb.book)}/${ch}`}
                        className={cn(
                          "w-7 h-7 text-[11px] font-medium flex items-center justify-center transition-all rounded-lg",
                          done
                            ? "bg-[#c9a65418] text-[#c9a654] border border-[#c9a65430]"
                            : "text-[#3d3a55] hover:text-[#55524a] border border-[#2e2b42] hover:border-[#3d3a55]"
                        )}>
                        {ch}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
