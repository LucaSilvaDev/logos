import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen, Tag, Calendar, Pencil } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PrintButton } from "@/components/PrintButton"
import { BiblicalContent } from "@/components/BiblicalContent"

export default async function DevocionalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user!.id!

  const devotional = await db.devotional.findUnique({ where: { id, userId } })
  if (!devotional) notFound()

  const tags = devotional.tags ? devotional.tags.split(",").filter(Boolean) : []

  return (
    <div className="max-w-2xl mx-auto px-2 py-8 space-y-6 animate-fade-in">

      <div className="flex items-center justify-between">
        <Link href="/devocional"
          className="flex items-center gap-1.5 text-[#55524a] hover:text-[#8a8375] text-sm transition-colors font-serif">
          <ArrowLeft className="w-4 h-4" /> Devocionais
        </Link>
        <div className="flex items-center gap-3">
          <PrintButton />
          <Link href={`/devocional/${id}/editar`}
            className="flex items-center gap-1.5 text-xs text-[#55524a] hover:text-[#8a8375] transition-colors font-serif">
            <Pencil className="w-3.5 h-3.5" /> Editar
          </Link>
        </div>
      </div>

      <div>
        <h1 className="font-serif text-2xl text-[#e2d9c5] font-normal">{devotional.title}</h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-[#55524a] font-serif">
            <Calendar className="w-3 h-3" />
            {format(new Date(devotional.createdAt), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          {devotional.bibleRef && (
            <span className="flex items-center gap-1 text-xs text-[#c9a654] font-serif italic">
              <BookOpen className="w-3 h-3" />
              {devotional.bibleRef}
            </span>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Tag className="w-3 h-3 text-[#3d3a55]" />
            {tags.map(t => (
              <span key={t} className="text-[10px] text-[#3d3a55]">#{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="card-soft px-6 py-6">
        <BiblicalContent
          html={devotional.content}
          className="prose-devotional text-[#8a8375] leading-relaxed"
        />
      </div>

    </div>
  )
}
