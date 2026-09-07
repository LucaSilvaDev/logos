import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { PageHeader, PageActionLink } from "@/components/layout/PageHeader"
import { NotebookPen } from "lucide-react"
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

      <PageHeader
        title="Devocional"
        description={`${filtered.length} entrada${filtered.length !== 1 ? "s" : ""}${activeTag ? ` · #${activeTag}` : ""}`}
        action={<PageActionLink href="/devocional/novo">Nova entrada →</PageActionLink>}
      />

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <Link
            href="/devocional"
            className={`chip ${!activeTag ? "chip-on" : ""}`}
          >
            Todos
          </Link>
          {allTags.map(t => (
            <Link
              key={t}
              href={activeTag === t ? "/devocional" : `/devocional?tag=${encodeURIComponent(t)}`}
              className={`chip ${activeTag === t ? "chip-on" : ""}`}
            >
              #{t}
            </Link>
          ))}
        </div>
      )}

      <div className="hairline" />

      {filtered.length === 0 && devotionals.length > 0 ? (
        <div className="text-center py-12">
          <p className="font-serif text-[16px]">Nenhum devocional com a tag <span className="font-medium">#{activeTag}</span></p>
          <Link href="/devocional" className="text-link mt-3 inline-block">
            Ver todos →
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <NotebookPen className="w-5 h-5 text-[#979799] mx-auto mb-4" />
          <p className="font-serif text-[20px]">Nenhum devocional ainda</p>
          <p className="page-desc mb-6">Comece registrando sua meditação diária</p>
          <Link href="/devocional/novo" className="pill-action pill-action-fill">
            Criar primeira entrada →
          </Link>
          <div className="quote-card quote-card-accent mt-10 text-left max-w-sm mx-auto">
            <p className="font-serif text-[16px] leading-relaxed italic">
              &ldquo;Medita nisto, emprega-te totalmente nisso, para que o teu aproveitamento seja manifesto a todos.&rdquo;
            </p>
            <p className="quote-cite mt-3">1 Timóteo 4:15</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((d: { id: string; title: string; bibleRef: string | null; tags: string | null; createdAt: Date; content: string }) => {
            const tags = d.tags ? d.tags.split(",").filter(Boolean) : []
            const preview = d.content.replace(/<[^>]*>/g, "").slice(0, 140)
            return (
              <Link key={d.id} href={`/devocional/${d.id}`} className="mist-row">
                <div className="min-w-0">
                  <p className="text-[17px]">{d.title}</p>
                  {d.bibleRef && (
                    <p className="font-serif italic text-[15px] text-[#777b86] mt-0.5">{d.bibleRef}</p>
                  )}
                  {preview && (
                    <p className="text-[14px] text-[#777b86] mt-1 line-clamp-2">{preview}</p>
                  )}
                  {tags.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {tags.map(t => (
                        <span key={t} className="quote-cite">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="quote-cite shrink-0">
                  {format(new Date(d.createdAt), "d MMM yyyy", { locale: ptBR })}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
