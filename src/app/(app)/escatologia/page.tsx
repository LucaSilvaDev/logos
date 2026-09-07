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
          <h1 className="page-title">Escatologia</h1>
          <p className="page-desc">Relógio profético · {totalProphetic} capítulos</p>
        </div>
        <div className="text-right">
          <p className="home-stat">{pct}<span className="text-[15px] text-[#777b86]">%</span></p>
          <p className="home-stat-label">{studied}/{totalProphetic}</p>
        </div>
      </div>

      <div className="hairline" />

      <div className="space-y-3">
        <div className="flex justify-between text-[14px] text-[#777b86]">
          <span>Capítulos estudados</span>
          <span className="tabular-nums">{studied} / {totalProphetic}</span>
        </div>
        <div className="track">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="section-title">Posição escatológica</h2>
        <div className="space-y-2">
          {POSITION_NOTES.map((p) => (
            <div key={p.label} className="quote-card">
              <p className="font-serif text-[16px] mb-0.5">{p.label}</p>
              <p className="quote-cite leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Timeline profética</h2>
        <div className="relative">
          <div className="absolute left-[68px] top-0 bottom-0 w-px bg-[#ececec]" />
          {TIMELINE_EVENTS.map((e, i) => (
            <div key={i} className="flex gap-4 mb-5">
              <div className="w-16 text-right pt-0.5 flex-shrink-0">
                <span className="quote-cite">{e.phase}</span>
              </div>
              <div className="w-2 h-2 rounded-full border border-[#ececec] bg-white flex-shrink-0 mt-1.5 relative z-10" />
              <div className="flex-1">
                <p className="font-serif text-[16px] mb-0.5">{e.title}</p>
                <p className="quote-cite leading-relaxed">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Capítulos proféticos</h2>
        <div className="space-y-5">
          {PROPHETIC_BOOKS.map((pb) => {
            const studiedChapters = pb.propheticChapters.filter(c => studiedSet.has(`${pb.book}-${c}`))
            const allDone = studiedChapters.length === pb.propheticChapters.length
            return (
              <div key={pb.book}>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#979799]" />
                    <h3 className="font-serif text-[16px]">{pb.book}</h3>
                  </div>
                  <span className={cn("quote-cite tabular-nums", allDone && "text-inherit")}>
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
                          "w-8 h-8 text-[13px] font-medium flex items-center justify-center rounded-lg transition-colors",
                          done ? "chip-on" : "chip"
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
