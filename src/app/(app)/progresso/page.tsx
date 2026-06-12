import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { BOOK_CHAPTERS, BOOK_ID_NAMES } from "@/lib/reading-plan"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata = { title: "Progresso — Selah" }

const AT_BOOKS = [
  "GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA",
  "1KI","2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO",
  "ECC","SNG","ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO",
  "OBA","JON","MIC","NAH","HAB","ZEP","HAG","ZEC","MAL",
]
const NT_BOOKS = [
  "MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH",
  "PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS",
  "1PE","2PE","1JN","2JN","3JN","JUD","REV",
]

export default async function ProgressoPage() {
  const session = await auth()
  const userId  = session!.user!.id!

  const reads = await db.chapterRead.findMany({
    where: { userId },
    select: { book: true, chapter: true },
  })

  const readSet = new Set(reads.map(r => `${r.book}-${r.chapter}`))

  const totalChapters = Object.values(BOOK_CHAPTERS).reduce((a, b) => a + b, 0)
  const totalRead     = reads.length
  const pct           = totalChapters > 0 ? ((totalRead / totalChapters) * 100) : 0

  function BookGrid({ bookId }: { bookId: string }) {
    const total  = BOOK_CHAPTERS[bookId] ?? 0
    const name   = BOOK_ID_NAMES[bookId] ?? bookId
    const doneN  = Array.from({ length: total }, (_, i) => i + 1).filter(c => readSet.has(`${bookId}-${c}`)).length
    const allDone = doneN === total

    return (
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-1">
          <Link
            href={`/biblia?book=${bookId}`}
            className={`text-[11px] font-serif truncate transition-colors ${allDone ? "text-[#c9a654]" : "text-[#55524a] hover:text-[#8a8375]"}`}
          >
            {name}
          </Link>
          {doneN > 0 && (
            <span className="text-[9px] text-[#3d3a55] shrink-0 tabular-nums">
              {doneN}/{total}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-[2px]">
          {Array.from({ length: total }, (_, i) => {
            const ch   = i + 1
            const done = readSet.has(`${bookId}-${ch}`)
            return (
              <Link
                key={ch}
                href={`/biblia?book=${bookId}&chapter=${ch}`}
                title={`${name} ${ch}`}
                className={`
                  w-[10px] h-[10px] rounded-[2px] transition-all duration-200
                  ${done
                    ? "bg-[#c9a654] opacity-90 hover:opacity-100"
                    : "bg-[#1e1c2e] hover:bg-[#2e2b42]"
                  }
                `}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-[#3d3a55] hover:text-[#8a8375] transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="font-display text-[9px] text-[#c9a654] uppercase tracking-[0.25em]">Jornada</p>
          <h1 className="font-serif text-[#c9c0a8] text-lg">Progresso da Bíblia</h1>
        </div>
      </div>

      {/* Overall progress */}
      <div className="card-soft px-6 py-5 space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-[9px] text-[#c9a654] uppercase tracking-[0.2em] opacity-70 mb-1">Total lido</p>
            <p className="font-serif text-3xl text-[#e2d9c5]">
              {pct.toFixed(1)}<span className="text-lg text-[#8a8375]">%</span>
            </p>
          </div>
          <p className="text-[#3d3a55] text-sm font-serif">
            {totalRead} <span className="text-[#2e2b42]">/</span> {totalChapters} capítulos
          </p>
        </div>
        <div className="h-2 rounded-full bg-[#1a1928] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#c9a654] to-[#e8c87a] transition-all duration-700"
            style={{ width: `${Math.max(pct, pct > 0 ? 0.3 : 0)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#2e2b42]">
          <span>Gênesis</span>
          <span>Apocalipse</span>
        </div>
      </div>

      {/* AT */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em]">Antigo Testamento</p>
          <div className="flex-1 h-px bg-[#1e1c2e]" />
          <p className="text-[10px] text-[#3d3a55] tabular-nums">
            {AT_BOOKS.reduce((acc, id) => {
              const total = BOOK_CHAPTERS[id] ?? 0
              return acc + Array.from({ length: total }, (_, i) => i + 1).filter(c => readSet.has(`${id}-${c}`)).length
            }, 0)}
            {" / "}
            {AT_BOOKS.reduce((acc, id) => acc + (BOOK_CHAPTERS[id] ?? 0), 0)}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-4">
          {AT_BOOKS.map(id => <BookGrid key={id} bookId={id} />)}
        </div>
      </section>

      {/* NT */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em]">Novo Testamento</p>
          <div className="flex-1 h-px bg-[#1e1c2e]" />
          <p className="text-[10px] text-[#3d3a55] tabular-nums">
            {NT_BOOKS.reduce((acc, id) => {
              const total = BOOK_CHAPTERS[id] ?? 0
              return acc + Array.from({ length: total }, (_, i) => i + 1).filter(c => readSet.has(`${id}-${c}`)).length
            }, 0)}
            {" / "}
            {NT_BOOKS.reduce((acc, id) => acc + (BOOK_CHAPTERS[id] ?? 0), 0)}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-4">
          {NT_BOOKS.map(id => <BookGrid key={id} bookId={id} />)}
        </div>
      </section>

    </div>
  )
}
