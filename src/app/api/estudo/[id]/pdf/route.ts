import { NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { BOOK_ID_NAMES } from "@/lib/reading-plan"
import { SelahDocument } from "@/lib/pdf/SelahDocument"

const NOTE_TYPE_LABELS: Record<string, string> = {
  exegesis:    "Exegese",
  theology:    "Teologia",
  application: "Aplicação",
  word_study:  "Estudo de Palavra",
  cross_ref:   "Referência Cruzada",
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const note = await db.studyNote.findFirst({
    where: { id, userId: session.user.id },
    select: { title: true, content: true, book: true, chapter: true, verse: true, type: true, tags: true, updatedAt: true },
  })
  if (!note) return NextResponse.json({ error: "not_found" }, { status: 404 })

  const bookName = BOOK_ID_NAMES[note.book] ?? note.book
  const ref = `${bookName}${note.chapter ? ` ${note.chapter}` : ""}${note.verse ? `:${note.verse}` : ""}`
  const date = format(new Date(note.updatedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
  const tags = note.tags ? note.tags.split(",").filter(Boolean) : []

  const buffer = await renderToBuffer(
    React.createElement(SelahDocument, {
      type:    "estudo",
      title:   note.title,
      content: note.content,
      meta: {
        label: NOTE_TYPE_LABELS[note.type] ?? note.type,
        ref,
        date,
        tags,
      },
    })
  )

  const filename = `${note.title.replace(/[^a-z0-9À-ú\s]/gi, "").trim().replace(/\s+/g, "_")}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
