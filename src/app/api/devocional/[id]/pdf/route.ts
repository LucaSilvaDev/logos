import { NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { SelahDocument } from "@/lib/pdf/SelahDocument"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const devotional = await db.devotional.findFirst({
    where: { id, userId: session.user.id },
    select: { title: true, content: true, bibleRef: true, tags: true, createdAt: true },
  })
  if (!devotional) return NextResponse.json({ error: "not_found" }, { status: 404 })

  const tags = devotional.tags ? devotional.tags.split(",").filter(Boolean) : []
  const date = format(new Date(devotional.createdAt), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })

  const buffer = await renderToBuffer(
    React.createElement(SelahDocument, {
      type:    "devocional",
      title:   devotional.title,
      content: devotional.content,
      meta: {
        ref:  devotional.bibleRef ?? undefined,
        date,
        tags,
      },
    })
  )

  const filename = `${devotional.title.replace(/[^a-z0-9À-ú\s]/gi, "").trim().replace(/\s+/g, "_")}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
