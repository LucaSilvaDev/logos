import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen, Pencil, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { BiblicalContent } from "@/components/BiblicalContent"

const NOTE_TYPE_LABELS: Record<string, string> = {
  exegesis:    "Exegese",
  theology:    "Teologia",
  application: "Aplicação",
  word_study:  "Estudo de Palavra",
  cross_ref:   "Referência Cruzada",
}

export default async function StudyNoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user!.id!

  const note = await db.studyNote.findUnique({ where: { id, userId } })
  if (!note) notFound()

  return (
    <div className="max-w-2xl mx-auto px-2 py-8 space-y-6 animate-fade-in">

      <div className="flex items-center justify-between">
        <Link href="/estudo"
          className="flex items-center gap-1.5 text-[#55524a] hover:text-[#8a8375] text-sm transition-colors font-serif">
          <ArrowLeft className="w-4 h-4" /> Estudo
        </Link>
        <Link href={`/estudo/${id}/editar`}
          className="flex items-center gap-1.5 text-xs text-[#55524a] hover:text-[#8a8375] transition-colors font-serif">
          <Pencil className="w-3.5 h-3.5" /> Editar
        </Link>
      </div>

      <div>
        <span className="text-[10px] text-[#55524a] font-display uppercase tracking-wider">
          {NOTE_TYPE_LABELS[note.type] ?? note.type}
        </span>
        <h1 className="font-serif text-2xl text-[#e2d9c5] font-normal mt-1">{note.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-[#c9a654] font-serif italic">
            <BookOpen className="w-3 h-3" />
            {note.book}{note.chapter ? ` ${note.chapter}` : ""}{note.verse ? `:${note.verse}` : ""}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#55524a] font-serif">
            <Calendar className="w-3 h-3" />
            {format(new Date(note.updatedAt), "d 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
      </div>

      <div className="card-soft px-6 py-6">
        <BiblicalContent
          html={note.content}
          className="prose-devotional text-[#8a8375] leading-relaxed"
        />
      </div>

    </div>
  )
}
