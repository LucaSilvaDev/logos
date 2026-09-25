// Parsers puros para conteúdo bíblico externo. Extraídos da rota /api/biblia
// para poderem ser testados sem carregar Prisma/NextAuth.

export type Verse = { number: number; text: string }

// Parses YouVersion HTML: <span class="yv-v" v="N"></span><span class="yv-vlbl">N</span>TEXT
export function parseYVHtml(html: string): Verse[] {
  const verses: Verse[] = []
  const marker = /<span class="yv-v" v="(\d+)"><\/span><span class="yv-vlbl">\d+<\/span>/g
  const parts = html.split(marker)
  for (let i = 1; i < parts.length; i += 2) {
    const num = parseInt(parts[i])
    const raw = parts[i + 1] ?? ""
    const text = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    if (num > 0 && text.length > 0) verses.push({ number: num, text })
  }
  return verses
}

// Parses BibliaOnline HTML (www.bibliaonline.com.br).
// Estrutura: data-vb="" data-v=".N." marca início de versículo.
export function parseBibliaOnlineHtml(html: string): Verse[] {
  // O conteúdo do capítulo fica dentro de <article data-fragments>...</article>.
  // Sem isso, o último marcador data-v da página não tem um próximo marcador
  // que delimite seu fim, e o "versículo" final engole o resto do HTML
  // (navegação, scripts, anúncios) até o fim do documento.
  const articleStart = html.indexOf("<article data-fragments")
  const articleEnd   = articleStart === -1 ? -1 : html.indexOf("</article>", articleStart)
  const content = articleStart === -1 || articleEnd === -1 ? html : html.slice(articleStart, articleEnd)

  const verseRe = /data-v="\.(\d+)\."/g
  const starts: { num: number; idx: number }[] = []
  let m: RegExpExecArray | null
  verseRe.lastIndex = 0
  while ((m = verseRe.exec(content)) !== null) {
    starts.push({ num: parseInt(m[1]), idx: m.index })
  }
  if (starts.length === 0) return []

  const verseMap = new Map<number, string[]>()

  for (let i = 0; i < starts.length; i++) {
    const segStart = starts[i].idx
    const segEnd   = i + 1 < starts.length ? starts[i + 1].idx : content.length
    let   segment  = content.slice(segStart, segEnd)

    segment = segment.replace(/^[^>]*>/, "")
    segment = segment.replace(/<button[^>]*data-note[^>]*>[\s\S]*?<\/button>/gi, "")
    segment = segment.replace(/<span[^>]*data-vn[^>]*>[\s\S]*?<\/span>/gi, "")
    segment = segment.replace(/<!--[\s\S]*?-->/g, "")
    segment = segment.replace(/<[^>]+>/g, " ")
    segment = segment.replace(/<[^>]*$/, "")
    segment = segment.replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    segment = segment.replace(/\s*Copyright[©®].*$/i, "").replace(/\s*Nova Almeida Atualizada[©®].*$/i, "")
    const text = segment.replace(/\s+/g, " ").trim()

    const num = starts[i].num
    // O primeiro marcador de cada versículo costuma ser um rótulo visual cujo
    // único conteúdo é o próprio número (ex.: "1") — não é texto do versículo.
    if (num > 0 && text.length > 0 && text !== String(num)) {
      if (!verseMap.has(num)) verseMap.set(num, [])
      verseMap.get(num)!.push(text)
    }
  }

  return Array.from(verseMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([number, parts]) => ({ number, text: parts.join(" ") }))
}
