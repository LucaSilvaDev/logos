import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Plus, FileText, BookOpen } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AT_GROUPS, NT_GROUPS, BOOK_CATEGORIES } from "@/lib/bible-categories"

const AT_BOOKS = [
  { id: "GEN", name: "Gênesis",       desc: "Criação, queda e aliança" },
  { id: "EXO", name: "Êxodo",         desc: "Libertação e lei de Deus" },
  { id: "LEV", name: "Levítico",      desc: "Santidade e sacrifício" },
  { id: "NUM", name: "Números",       desc: "Peregrinação no deserto" },
  { id: "DEU", name: "Deuteronômio",  desc: "Renovação da aliança" },
  { id: "JOS", name: "Josué",         desc: "Conquista da terra prometida" },
  { id: "JDG", name: "Juízes",        desc: "Ciclos de apostasia e resgate" },
  { id: "RUT", name: "Rute",          desc: "Redenção e fidelidade" },
  { id: "1SA", name: "1 Samuel",      desc: "Saul e o surgimento de Davi" },
  { id: "2SA", name: "2 Samuel",      desc: "O reino de Davi" },
  { id: "1KI", name: "1 Reis",        desc: "Salomão e a divisão do reino" },
  { id: "2KI", name: "2 Reis",        desc: "Queda de Israel e Judá" },
  { id: "1CH", name: "1 Crônicas",    desc: "Genealogias e Davi" },
  { id: "2CH", name: "2 Crônicas",    desc: "Salomão até o exílio" },
  { id: "EZR", name: "Esdras",        desc: "Retorno do exílio" },
  { id: "NEH", name: "Neemias",       desc: "Reconstrução de Jerusalém" },
  { id: "EST", name: "Ester",         desc: "Providência de Deus no exílio" },
  { id: "JOB", name: "Jó",            desc: "Soberania de Deus no sofrimento" },
  { id: "PSA", name: "Salmos",        desc: "A oração de Israel — 150 poemas" },
  { id: "PRO", name: "Provérbios",    desc: "Sabedoria prática para a vida" },
  { id: "ECC", name: "Eclesiastes",   desc: "Vaidade e temor a Deus" },
  { id: "SNG", name: "Cânticos",      desc: "Amor humano e divino" },
  { id: "ISA", name: "Isaías",        desc: "O evangelho do Antigo Testamento" },
  { id: "JER", name: "Jeremias",      desc: "Juízo e nova aliança" },
  { id: "LAM", name: "Lamentações",   desc: "Pranto pela queda de Jerusalém" },
  { id: "EZK", name: "Ezequiel",      desc: "Visões e restauração de Israel" },
  { id: "DAN", name: "Daniel",        desc: "Profecia e soberania de Deus" },
  { id: "HOS", name: "Oséias",        desc: "Amor fiel de Deus a Israel" },
  { id: "JOL", name: "Joel",          desc: "O dia do Senhor" },
  { id: "AMO", name: "Amós",          desc: "Justiça social e julgamento" },
  { id: "OBA", name: "Obadias",       desc: "Julgamento sobre Edom" },
  { id: "JON", name: "Jonas",         desc: "Misericórdia para as nações" },
  { id: "MIC", name: "Miquéias",      desc: "Justiça, misericórdia e humildade" },
  { id: "NAH", name: "Naum",          desc: "Queda de Nínive" },
  { id: "HAB", name: "Habacuque",     desc: "O justo viverá pela fé" },
  { id: "ZEP", name: "Sofonias",      desc: "Julgamento e restauração" },
  { id: "HAG", name: "Ageu",          desc: "Reconstrução do templo" },
  { id: "ZEC", name: "Zacarias",      desc: "Visões messiânicas" },
  { id: "MAL", name: "Malaquias",     desc: "Chamado ao arrependimento" },
]

const NT_BOOKS = [
  { id: "MAT", name: "Mateus",            desc: "O Rei Messias e seu reino" },
  { id: "MRK", name: "Marcos",            desc: "O Servo sofredor" },
  { id: "LUK", name: "Lucas",             desc: "O Filho do homem para todos" },
  { id: "JHN", name: "João",              desc: "O Verbo eterno — vida eterna" },
  { id: "ACT", name: "Atos",              desc: "A missão da Igreja primitiva" },
  { id: "ROM", name: "Romanos",           desc: "A epístola da doutrina" },
  { id: "1CO", name: "1 Coríntios",       desc: "Ordem e graça na Igreja" },
  { id: "2CO", name: "2 Coríntios",       desc: "Ministério e sofrimento" },
  { id: "GAL", name: "Gálatas",           desc: "Graça contra a lei" },
  { id: "EPH", name: "Efésios",           desc: "A Igreja e a eleição" },
  { id: "PHP", name: "Filipenses",        desc: "A alegria em Cristo" },
  { id: "COL", name: "Colossenses",       desc: "A supremacia de Cristo" },
  { id: "1TH", name: "1 Tessalonicenses", desc: "Esperança na segunda vinda" },
  { id: "2TH", name: "2 Tessalonicenses", desc: "O dia do Senhor" },
  { id: "1TI", name: "1 Timóteo",         desc: "Ordem e doutrina na Igreja" },
  { id: "2TI", name: "2 Timóteo",         desc: "Firmeza até o fim" },
  { id: "TIT", name: "Tito",              desc: "Liderança e sã doutrina" },
  { id: "PHM", name: "Filemom",           desc: "Reconciliação em Cristo" },
  { id: "HEB", name: "Hebreus",           desc: "Cristo como Sumo Sacerdote" },
  { id: "JAS", name: "Tiago",             desc: "Fé viva e obras" },
  { id: "1PE", name: "1 Pedro",           desc: "Esperança no sofrimento" },
  { id: "2PE", name: "2 Pedro",           desc: "Crescimento e falsos mestres" },
  { id: "1JN", name: "1 João",            desc: "Amor, luz e vida eterna" },
  { id: "2JN", name: "2 João",            desc: "Verdade e amor" },
  { id: "3JN", name: "3 João",            desc: "Hospitalidade e fidelidade" },
  { id: "JUD", name: "Judas",             desc: "Defesa da fé apostólica" },
  { id: "REV", name: "Apocalipse",        desc: "A revelação final de Cristo" },
]

const NOTE_TYPE_LABELS: Record<string, string> = {
  exegesis:    "Exegese",
  theology:    "Teologia",
  application: "Aplicação",
  word_study:  "Palavra",
  cross_ref:   "Ref. Cruzada",
}

export default async function EstudoPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const notes = await db.studyNote.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: { id: true, title: true, book: true, chapter: true, verse: true, type: true, tags: true, updatedAt: true },
  })

  const notesPerBook = notes.reduce<Record<string, number>>((acc, n) => {
    acc[n.book] = (acc[n.book] ?? 0) + 1
    return acc
  }, {})

  // Lookup único: bookId → { name, desc }
  const BOOK_META = Object.fromEntries(
    [...AT_BOOKS, ...NT_BOOKS].map(b => [b.id, b])
  )

  // Grupos únicos para a legenda (cartas unificadas em uma entrada)
  const LEGEND = [
    { color: "#c9a654", label: "Lei — Pentateuco",   desc: "Os 5 livros de Moisés: criação, aliança e a lei dada a Israel no Sinai." },
    { color: "#6b8fa8", label: "História",            desc: "Do Josué ao Ester e Atos — a narrativa histórica do povo de Deus na terra." },
    { color: "#a87b9c", label: "Poesia e Sabedoria",  desc: "Jó a Cânticos — adoração, sofrimento, sabedoria prática e amor contemplativo." },
    { color: "#4a7a5a", label: "Grandes Profetas",    desc: "Isaías a Daniel — profecias extensas sobre julgamento e esperança messiânica." },
    { color: "#7aaa82", label: "Profetas Menores",    desc: "Oséias a Malaquias — doze vozes proféticas, curtas, mas não menos importantes." },
    { color: "#7a6aaa", label: "Evangelhos",          desc: "Mateus a João — a vida, morte e ressurreição de Jesus Cristo em quatro perspectivas." },
    { color: "#c4783a", label: "Cartas",              desc: "Romanos a Judas — ensinos doutrinários e práticos enviados às igrejas e líderes." },
    { color: "#c9a654", label: "Profecia",            desc: "Apocalipse — visões do fim dos tempos, juízo final e a vitória definitiva de Cristo." },
  ]

  return (
    <div className="max-w-3xl mx-auto px-2 py-8 space-y-8 animate-page-in">

      <div className="flex items-end justify-between">
        <div>
          <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em] mb-1">Aprofundamento</p>
          <h1 className="font-serif text-3xl text-[#e2d9c5] font-normal">Estudo</h1>
          <p className="text-[#55524a] text-xs mt-1">{notes.length} nota{notes.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/estudo/nova"
          className="flex items-center gap-1.5 text-sm text-[#c9a654] hover:opacity-80 transition-opacity font-serif">
          <Plus className="w-4 h-4" /> Nova nota
        </Link>
      </div>

      <div className="h-px bg-[#2e2b42]" />

      {/* Legenda de cores */}
      <section className="card-soft px-5 py-4 space-y-3">
        <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em]">Guia de Cores — Gêneros Literários</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {LEGEND.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-[3px] self-stretch rounded-full flex-shrink-0 mt-0.5"
                style={{ background: item.color }} />
              <div>
                <p className="font-display text-[9px] uppercase tracking-[0.2em] mb-0.5"
                  style={{ color: item.color }}>
                  {item.label}
                </p>
                <p className="text-[#55524a] text-[10px] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Antigo Testamento — agrupado por gênero */}
      <section className="space-y-6">
        <p className="font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.28em]">Antigo Testamento</p>
        {AT_GROUPS.map(group => {
          const cat = BOOK_CATEGORIES[group.category]
          return (
            <div key={group.category} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <span className="font-display text-[8px] uppercase tracking-[0.28em]"
                  style={{ color: cat.color }}>
                  {cat.label}
                </span>
                <div className="flex-1 h-px" style={{ background: cat.color, opacity: 0.15 }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {group.ids.map(id => {
                  const b = BOOK_META[id]
                  if (!b) return null
                  return (
                    <Link key={id} href={`/estudo/livro/${id}`}
                      className="group card-soft px-3 py-3 flex flex-col gap-1.5 transition-all"
                      style={{ borderLeft: `3px solid ${cat.color}` }}>
                      <div className="flex items-center justify-between">
                        <span className="font-display text-[7px] uppercase tracking-[0.18em]"
                          style={{ color: cat.color }}>
                          {cat.label}
                        </span>
                        {notesPerBook[id] ? (
                          <span className="text-[9px] text-[#55524a] px-1.5 py-0.5 rounded-full"
                            style={{ background: cat.color + "22" }}>
                            {notesPerBook[id]}
                          </span>
                        ) : null}
                      </div>
                      <p className="font-serif text-[#8a8375] text-sm group-hover:text-[#c9c0a8] transition-colors leading-tight">{b.name}</p>
                      <p className="text-[#3d3a55] text-[10px] leading-tight">{b.desc}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>

      <div className="h-px bg-[#2e2b42] opacity-50" />

      {/* Novo Testamento — agrupado por gênero */}
      <section className="space-y-6">
        <p className="font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.28em]">Novo Testamento</p>
        {NT_GROUPS.map(group => {
          const cat = BOOK_CATEGORIES[group.category]
          return (
            <div key={group.category} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <span className="font-display text-[8px] uppercase tracking-[0.28em]"
                  style={{ color: cat.color }}>
                  {cat.label}
                </span>
                <div className="flex-1 h-px" style={{ background: cat.color, opacity: 0.15 }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {group.ids.map(id => {
                  const b = BOOK_META[id]
                  if (!b) return null
                  return (
                    <Link key={id} href={`/estudo/livro/${id}`}
                      className="group card-soft px-3 py-3 flex flex-col gap-1.5 transition-all"
                      style={{ borderLeft: `3px solid ${cat.color}` }}>
                      <div className="flex items-center justify-between">
                        <span className="font-display text-[7px] uppercase tracking-[0.18em]"
                          style={{ color: cat.color }}>
                          {cat.label}
                        </span>
                        {notesPerBook[id] ? (
                          <span className="text-[9px] text-[#55524a] px-1.5 py-0.5 rounded-full"
                            style={{ background: cat.color + "22" }}>
                            {notesPerBook[id]}
                          </span>
                        ) : null}
                      </div>
                      <p className="font-serif text-[#8a8375] text-sm group-hover:text-[#c9c0a8] transition-colors leading-tight">{b.name}</p>
                      <p className="text-[#3d3a55] text-[10px] leading-tight">{b.desc}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>

      {/* Notas recentes */}
      <section className="space-y-3">
        <p className="font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.25em]">Notas Recentes</p>
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-5 h-5 text-[#2e2b42] mx-auto mb-3" />
            <p className="font-serif text-[#55524a]">Nenhuma nota ainda</p>
            <Link href="/estudo/nova"
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#c9a654] hover:opacity-80 transition-opacity font-serif">
              <Plus className="w-3.5 h-3.5" /> Criar nota
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((n: { id: string; title: string; book: string; chapter: number | null; verse: number | null; type: string; tags: string; updatedAt: Date }) => {
              const typeLabel = NOTE_TYPE_LABELS[n.type] ?? n.type
              return (
                <Link key={n.id} href={`/estudo/${n.id}`}
                  className="card-soft flex items-center gap-4 px-4 py-3.5 group">
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-[#c9c0a8] text-sm group-hover:text-[#e2d9c5] transition-colors truncate">
                      {n.title}
                    </p>
                    <p className="text-[#55524a] text-xs mt-0.5 font-serif italic">
                      {n.book}{n.chapter ? ` ${n.chapter}` : ""}{n.verse ? `:${n.verse}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#3d3a55] flex-shrink-0">{typeLabel}</span>
                  <span className="text-[10px] text-[#3d3a55] flex-shrink-0">
                    {format(new Date(n.updatedAt), "d MMM", { locale: ptBR })}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
