import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { ArrowLeft, Plus, FileText, BookOpen } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { BOOK_ID_NAMES } from "@/lib/reading-plan"

const NOTE_TYPE_LABELS: Record<string, string> = {
  exegesis:    "Exegese",
  theology:    "Teologia",
  application: "Aplicação",
  word_study:  "Palavra",
  cross_ref:   "Ref. Cruzada",
}

export default async function EstudoLivroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user!.id!

  const bookName = BOOK_ID_NAMES[id] ?? id

  const notes = await db.studyNote.findMany({
    where: { userId, book: bookName },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="max-w-2xl mx-auto px-2 py-8 space-y-6 animate-fade-in">

      <div className="flex items-center justify-between">
        <Link href="/estudo"
          className="flex items-center gap-1.5 text-[#55524a] hover:text-[#8a8375] text-sm transition-colors font-serif">
          <ArrowLeft className="w-4 h-4" /> Estudo
        </Link>
        <Link href={`/estudo/nova?book=${encodeURIComponent(bookName)}`}
          className="flex items-center gap-1.5 text-sm text-[#c9a654] hover:opacity-80 transition-opacity font-serif">
          <Plus className="w-4 h-4" /> Nova nota
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-[#3d3a55]" />
          <h1 className="font-serif text-2xl text-[#e2d9c5] font-normal">{bookName}</h1>
        </div>
        <p className="text-[#55524a] text-xs">{notes.length} nota{notes.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="h-px bg-[#2e2b42]" />

      {notes.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-5 h-5 text-[#2e2b42] mx-auto mb-3" />
          <p className="font-serif text-[#55524a]">Nenhuma nota para {bookName}</p>
          <Link href={`/estudo/nova?book=${encodeURIComponent(bookName)}`}
            className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#c9a654] hover:opacity-80 transition-opacity font-serif">
            <Plus className="w-3.5 h-3.5" /> Criar primeira nota
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((n: { id: string; title: string; chapter: number | null; verse: number | null; type: string; updatedAt: Date }) => (
            <Link key={n.id} href={`/estudo/${n.id}`}
              className="card-soft flex items-center gap-3 px-4 py-3 group">
              <FileText className="w-3.5 h-3.5 text-[#3d3a55] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-serif text-[#c9c0a8] text-sm group-hover:text-[#e2d9c5] transition-colors">{n.title}</p>
                {(n.chapter || n.verse) && (
                  <p className="text-[#55524a] text-xs font-serif italic">
                    {bookName}{n.chapter ? ` ${n.chapter}` : ""}{n.verse ? `:${n.verse}` : ""}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-[#3d3a55] flex-shrink-0">
                {NOTE_TYPE_LABELS[n.type] ?? n.type}
              </span>
              <span className="text-[10px] text-[#3d3a55] flex-shrink-0">
                {format(new Date(n.updatedAt), "d MMM", { locale: ptBR })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
