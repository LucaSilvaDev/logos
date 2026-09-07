import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { PageHeader, PageActionLink } from "@/components/layout/PageHeader"
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
    { label: "Lei — Pentateuco",   desc: "Os 5 livros de Moisés: criação, aliança e a lei dada a Israel no Sinai." },
    { label: "História",            desc: "Do Josué ao Ester e Atos — a narrativa histórica do povo de Deus na terra." },
    { label: "Poesia e Sabedoria",  desc: "Jó a Cânticos — adoração, sofrimento, sabedoria prática e amor contemplativo." },
    { label: "Grandes Profetas",    desc: "Isaías a Daniel — profecias extensas sobre julgamento e esperança messiânica." },
    { label: "Profetas Menores",    desc: "Oséias a Malaquias — doze vozes proféticas, curtas, mas não menos importantes." },
    { label: "Evangelhos",          desc: "Mateus a João — a vida, morte e ressurreição de Jesus Cristo em quatro perspectivas." },
    { label: "Cartas",              desc: "Romanos a Judas — ensinos doutrinários e práticos enviados às igrejas e líderes." },
    { label: "Profecia",            desc: "Apocalipse — visões do fim dos tempos, juízo final e a vitória definitiva de Cristo." },
  ]

  return (
    <div className="max-w-3xl mx-auto px-2 py-8 space-y-8 animate-page-in">

      <PageHeader
        title="Estudo"
        description={`${notes.length} nota${notes.length !== 1 ? "s" : ""}`}
        action={<PageActionLink href="/estudo/nova">Nova nota →</PageActionLink>}
      />

      <div className="hairline" />

      <section className="quote-card space-y-4">
        <h2 className="section-title">Gêneros literários</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {LEGEND.map((item) => (
            <div key={item.label}>
              <p className="text-[15px] mb-0.5">{item.label}</p>
              <p className="quote-cite leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="section-title">Antigo Testamento</h2>
        {AT_GROUPS.map(group => {
          const cat = BOOK_CATEGORIES[group.category]
          return (
            <div key={group.category} className="space-y-2">
              <p className="quote-cite">{cat.label}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {group.ids.map(id => {
                  const b = BOOK_META[id]
                  if (!b) return null
                  return (
                    <Link key={id} href={`/estudo/livro/${id}`} className="mist-row flex-col items-start !gap-1">
                      {notesPerBook[id] ? (
                        <span className="chip chip-on text-[11px] py-0">{notesPerBook[id]}</span>
                      ) : null}
                      <p className="font-serif text-[16px] leading-tight">{b.name}</p>
                      <p className="quote-cite leading-tight">{b.desc}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>

      <div className="hairline" />

      <section className="space-y-6">
        <h2 className="section-title">Novo Testamento</h2>
        {NT_GROUPS.map(group => {
          const cat = BOOK_CATEGORIES[group.category]
          return (
            <div key={group.category} className="space-y-2">
              <p className="quote-cite">{cat.label}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {group.ids.map(id => {
                  const b = BOOK_META[id]
                  if (!b) return null
                  return (
                    <Link key={id} href={`/estudo/livro/${id}`} className="mist-row flex-col items-start !gap-1">
                      {notesPerBook[id] ? (
                        <span className="chip chip-on text-[11px] py-0">{notesPerBook[id]}</span>
                      ) : null}
                      <p className="font-serif text-[16px] leading-tight">{b.name}</p>
                      <p className="quote-cite leading-tight">{b.desc}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Notas recentes</h2>
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-5 h-5 text-[#979799] mx-auto mb-3" />
            <p className="font-serif text-[18px]">Nenhuma nota ainda</p>
            <Link href="/estudo/nova" className="pill-action mt-4">
              <Plus className="w-3.5 h-3.5" /> Criar nota
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((n: { id: string; title: string; book: string; chapter: number | null; verse: number | null; type: string; tags: string; updatedAt: Date }) => {
              const typeLabel = NOTE_TYPE_LABELS[n.type] ?? n.type
              return (
                <Link key={n.id} href={`/estudo/${n.id}`} className="mist-row">
                  <div className="min-w-0">
                    <p className="font-serif text-[16px] truncate">{n.title}</p>
                    <p className="quote-cite italic mt-0.5">
                      {n.book}{n.chapter ? ` ${n.chapter}` : ""}{n.verse ? `:${n.verse}` : ""}
                    </p>
                  </div>
                  <span className="quote-cite shrink-0">{typeLabel}</span>
                  <span className="quote-cite shrink-0">
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
