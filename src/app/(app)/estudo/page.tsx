import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Plus, FileText } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AT_GROUPS, NT_GROUPS, BOOK_CATEGORIES } from "@/lib/bible-categories"
import { BOOK_ID_NAMES } from "@/lib/reading-plan"

// id/name vêm de BOOK_ID_NAMES (lib/reading-plan.ts); aqui só a descrição teológica de cada livro.
const BOOK_DESC: Record<string, string> = {
  GEN: "Criação, queda e aliança",
  EXO: "Libertação e lei de Deus",
  LEV: "Santidade e sacrifício",
  NUM: "Peregrinação no deserto",
  DEU: "Renovação da aliança",
  JOS: "Conquista da terra prometida",
  JDG: "Ciclos de apostasia e resgate",
  RUT: "Redenção e fidelidade",
  "1SA": "Saul e o surgimento de Davi",
  "2SA": "O reino de Davi",
  "1KI": "Salomão e a divisão do reino",
  "2KI": "Queda de Israel e Judá",
  "1CH": "Genealogias e Davi",
  "2CH": "Salomão até o exílio",
  EZR: "Retorno do exílio",
  NEH: "Reconstrução de Jerusalém",
  EST: "Providência de Deus no exílio",
  JOB: "Soberania de Deus no sofrimento",
  PSA: "A oração de Israel — 150 poemas",
  PRO: "Sabedoria prática para a vida",
  ECC: "Vaidade e temor a Deus",
  SNG: "Amor humano e divino",
  ISA: "O evangelho do Antigo Testamento",
  JER: "Juízo e nova aliança",
  LAM: "Pranto pela queda de Jerusalém",
  EZK: "Visões e restauração de Israel",
  DAN: "Profecia e soberania de Deus",
  HOS: "Amor fiel de Deus a Israel",
  JOL: "O dia do Senhor",
  AMO: "Justiça social e julgamento",
  OBA: "Julgamento sobre Edom",
  JON: "Misericórdia para as nações",
  MIC: "Justiça, misericórdia e humildade",
  NAH: "Queda de Nínive",
  HAB: "O justo viverá pela fé",
  ZEP: "Julgamento e restauração",
  HAG: "Reconstrução do templo",
  ZEC: "Visões messiânicas",
  MAL: "Chamado ao arrependimento",
  MAT: "O Rei Messias e seu reino",
  MRK: "O Servo sofredor",
  LUK: "O Filho do homem para todos",
  JHN: "O Verbo eterno — vida eterna",
  ACT: "A missão da Igreja primitiva",
  ROM: "A epístola da doutrina",
  "1CO": "Ordem e graça na Igreja",
  "2CO": "Ministério e sofrimento",
  GAL: "Graça contra a lei",
  EPH: "A Igreja e a eleição",
  PHP: "A alegria em Cristo",
  COL: "A supremacia de Cristo",
  "1TH": "Esperança na segunda vinda",
  "2TH": "O dia do Senhor",
  "1TI": "Ordem e doutrina na Igreja",
  "2TI": "Firmeza até o fim",
  TIT: "Liderança e sã doutrina",
  PHM: "Reconciliação em Cristo",
  HEB: "Cristo como Sumo Sacerdote",
  JAS: "Fé viva e obras",
  "1PE": "Esperança no sofrimento",
  "2PE": "Crescimento e falsos mestres",
  "1JN": "Amor, luz e vida eterna",
  "2JN": "Verdade e amor",
  "3JN": "Hospitalidade e fidelidade",
  JUD: "Defesa da fé apostólica",
  REV: "A revelação final de Cristo",
}

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
    Object.entries(BOOK_ID_NAMES).map(([id, name]) => [id, { id, name, desc: BOOK_DESC[id] ?? "" }])
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
