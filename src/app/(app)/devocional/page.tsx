import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Plus, NotebookPen } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function DevocionalPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const session = await auth()
  const userId = session!.user!.id!
  const { tag: activeTag } = await searchParams

  const devotionals = await db.devotional.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, bibleRef: true, tags: true, createdAt: true, content: true },
  })

  // Collect all unique tags across devotionals
  const allTags = [...new Set(
    devotionals.flatMap((d: { tags: string | null }) =>
      d.tags ? d.tags.split(",").filter(Boolean) : []
    )
  )].sort()

  const filtered = activeTag
    ? devotionals.filter((d: { tags: string | null }) =>
        d.tags?.split(",").includes(activeTag)
      )
    : devotionals

  return (
    <div className="max-w-2xl mx-auto px-2 py-8 space-y-8">

      <div className="flex items-end justify-between">
        <div>
          <p className="candle-enter candle-delay-0 font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em] mb-1">Registro Espiritual</p>
          <h1 className="candle-enter candle-delay-1 font-serif text-3xl text-[#e2d9c5] font-normal">Devocional</h1>
          <p className="candle-enter candle-delay-2 text-[#55524a] text-xs mt-1">
            {filtered.length} entrada{filtered.length !== 1 ? "s" : ""}
            {activeTag && <span className="ml-1 text-[#c9a654] opacity-70">· #{activeTag}</span>}
          </p>
        </div>
        <Link href="/devocional/novo"
          className="candle-enter candle-delay-2 flex items-center gap-1.5 text-sm text-[#c9a654] hover:opacity-80 transition-opacity font-serif">
          <Plus className="w-4 h-4" /> Nova entrada
        </Link>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="candle-enter candle-delay-2 flex flex-wrap gap-2">
          <Link
            href="/devocional"
            className={`text-[11px] px-2.5 py-1 rounded-full transition-all font-serif ${
              !activeTag
                ? "text-[#c9a654] bg-[#c9a65418] border border-[#c9a65430]"
                : "text-[#3d3a55] hover:text-[#8a8375]"
            }`}
          >
            Todos
          </Link>
          {allTags.map(t => (
            <Link
              key={t}
              href={activeTag === t ? "/devocional" : `/devocional?tag=${encodeURIComponent(t)}`}
              className={`text-[11px] px-2.5 py-1 rounded-full transition-all font-serif ${
                activeTag === t
                  ? "text-[#c9a654] bg-[#c9a65418] border border-[#c9a65430]"
                  : "text-[#3d3a55] hover:text-[#8a8375]"
              }`}
            >
              #{t}
            </Link>
          ))}
        </div>
      )}

      <div className="candle-enter candle-delay-2 h-px bg-[#2e2b42] opacity-40" />

      {filtered.length === 0 && devotionals.length > 0 ? (
        <div className="candle-enter candle-delay-3 text-center py-12">
          <p className="font-serif text-[#55524a] text-sm">Nenhum devocional com a tag <span className="text-[#c9a654]">#{activeTag}</span></p>
          <Link href="/devocional" className="text-xs text-[#c9a654] hover:opacity-80 mt-3 inline-block">
            Ver todos →
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="candle-enter candle-delay-3 text-center py-16">
          <NotebookPen className="w-5 h-5 text-[#2e2b42] mx-auto mb-4" />
          <p className="font-serif text-[#55524a] text-lg">Nenhum devocional ainda</p>
          <p className="text-[#3d3a55] text-sm mt-1 mb-6">Comece registrando sua meditação diária</p>
          <Link href="/devocional/novo"
            className="text-sm text-[#c9a654] hover:opacity-80 transition-opacity font-serif">
            Criar primeira entrada →
          </Link>
          <div className="relative pl-6 pr-4 py-4 mt-10 text-left max-w-sm mx-auto">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#c9a654] opacity-25" />
            <p className="font-serif text-[#55524a] text-sm leading-relaxed italic">
              &ldquo;Medita nisto, emprega-te totalmente nisso, para que o teu aproveitamento seja manifesto a todos.&rdquo;
            </p>
            <p className="text-[#c9a654] text-xs mt-2 opacity-60">1 Timóteo 4:15</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[#1a1928]">
          {filtered.map((d: { id: string; title: string; bibleRef: string | null; tags: string | null; createdAt: Date; content: string }, i: number) => {
            const tags = d.tags ? d.tags.split(",").filter(Boolean) : []
            const preview = d.content.replace(/<[^>]*>/g, "").slice(0, 140)
            return (
              <Link key={d.id} href={`/devocional/${d.id}`}
                className="candle-flame group block px-2 py-5 hover:bg-[linear-gradient(90deg,rgba(201,166,84,0.05),transparent)] transition-all duration-300 rounded-xl"
                style={{ animationDelay: `${300 + i * 80}ms` }}>
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-0.5 h-4 bg-gradient-to-b from-[#c9a654] to-transparent opacity-50 rounded-full flex-shrink-0" />
                      <h3 className="font-serif text-[#8a8375] text-base group-hover:text-[#c9c0a8] transition-colors">
                        {d.title}
                      </h3>
                    </div>
                    {d.bibleRef && (
                      <p className="text-[#3d3a55] text-xs italic font-serif ml-3 mb-2">{d.bibleRef}</p>
                    )}
                    {preview && (
                      <p className="text-[#3d3a55] text-xs leading-relaxed ml-3 line-clamp-2">{preview}</p>
                    )}
                    {tags.length > 0 && (
                      <div className="flex gap-2 mt-2 ml-3 flex-wrap">
                        {tags.map(t => (
                          <span key={t} className="text-[10px] text-[#2e2b42]">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#2e2b42] flex-shrink-0 font-serif mt-0.5">
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
