import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Plus, NotebookPen } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function DevocionalPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const devotionals = await db.devotional.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, bibleRef: true, tags: true, createdAt: true, content: true },
  })

  return (
    <div className="max-w-2xl mx-auto px-2 py-8 space-y-8 animate-fade-in">

      <div className="flex items-end justify-between">
        <div>
          <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em] mb-1">Registro Espiritual</p>
          <h1 className="font-serif text-3xl text-[#e2d9c5] font-normal">Devocional</h1>
          <p className="text-[#55524a] text-xs mt-1">{devotionals.length} entrada{devotionals.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/devocional/novo"
          className="flex items-center gap-1.5 text-sm text-[#c9a654] hover:opacity-80 transition-opacity font-serif">
          <Plus className="w-4 h-4" /> Nova entrada
        </Link>
      </div>

      <div className="h-px bg-[#2e2b42]" />

      {devotionals.length === 0 ? (
        <div className="text-center py-20">
          <NotebookPen className="w-6 h-6 text-[#2e2b42] mx-auto mb-4" />
          <p className="font-serif text-[#55524a] text-lg">Nenhum devocional ainda</p>
          <p className="text-[#3d3a55] text-sm mt-1 mb-6">Comece registrando sua meditação diária</p>
          <Link href="/devocional/novo"
            className="text-sm text-[#c9a654] hover:opacity-80 transition-opacity font-serif">
            Criar primeira entrada →
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {devotionals.map((d: { id: string; title: string; bibleRef: string | null; tags: string | null; createdAt: Date; content: string }) => {
            const tags = d.tags ? d.tags.split(",").filter(Boolean) : []
            const preview = d.content.replace(/<[^>]*>/g, "").slice(0, 140)
            return (
              <Link key={d.id} href={`/devocional/${d.id}`}
                className="card-soft block px-5 py-4 group">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-1 rounded-full bg-[#c9a654] opacity-40 flex-shrink-0 mt-0.5" />
                      <h3 className="font-serif text-[#c9c0a8] text-base group-hover:text-[#e2d9c5] transition-colors">
                        {d.title}
                      </h3>
                    </div>
                    {d.bibleRef && (
                      <p className="text-[#55524a] text-xs italic font-serif ml-3 mb-2">{d.bibleRef}</p>
                    )}
                    {preview && (
                      <p className="text-[#55524a] text-xs leading-relaxed ml-3 line-clamp-2">{preview}</p>
                    )}
                    {tags.length > 0 && (
                      <div className="flex gap-1.5 mt-2 ml-3 flex-wrap">
                        {tags.map(t => (
                          <span key={t} className="text-[10px] text-[#3d3a55]">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-[#3d3a55] flex-shrink-0 font-serif">
                    {format(new Date(d.createdAt), "d MMM yyyy", { locale: ptBR })}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
