import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { BOOK_CHAPTERS, BOOK_ID_NAMES } from "@/lib/reading-plan"
import { PageHeader } from "@/components/layout/PageHeader"
import Link from "next/link"

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
            className={`text-[13px] font-serif truncate transition-colors ${allDone ? "text-inherit" : "text-[#777b86] hover:text-inherit"}`}
          >
            {name}
          </Link>
          {doneN > 0 && (
            <span className="quote-cite shrink-0 tabular-nums">
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
                className={`chapter-dot ${done ? "is-read" : ""}`}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      <PageHeader
        title="Progresso da Bíblia"
        description={`${totalRead} de ${totalChapters} capítulos`}
      />

      <div className="quote-card space-y-4">
        <div className="flex items-end justify-between">
          <p className="home-stat">
            {pct.toFixed(1)}<span className="text-[15px] text-[#777b86]">%</span>
          </p>
          <p className="quote-cite tabular-nums">
            {totalRead} / {totalChapters}
          </p>
        </div>
        <div className="track">
          <span style={{ width: `${Math.max(pct, pct > 0 ? 0.3 : 0)}%` }} />
        </div>
        <div className="flex justify-between quote-cite">
          <span>Gênesis</span>
          <span>Apocalipse</span>
        </div>
      </div>

      <section className="space-y-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="section-title">Antigo Testamento</h2>
          <p className="quote-cite tabular-nums">
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
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="section-title">Novo Testamento</h2>
          <p className="quote-cite tabular-nums">
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
