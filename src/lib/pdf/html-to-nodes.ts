/**
 * Converts TipTap HTML output to a plain-text paragraph array suitable for react-pdf.
 * Keeps paragraph structure, headings, block quotes and list items.
 * Returns an array of { type, text, bold?, italic? } nodes.
 */

export type PdfNode =
  | { type: "heading";    text: string; level: 2 | 3 }
  | { type: "paragraph";  segments: PdfSegment[] }
  | { type: "blockquote"; text: string }
  | { type: "listitem";   text: string; ordered: boolean; index: number }
  | { type: "divider" }

export interface PdfSegment {
  text:   string
  bold?:  boolean
  italic?: boolean
  code?:  boolean
}

function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
}

function parseInline(html: string): PdfSegment[] {
  const segments: PdfSegment[] = []

  // Split by inline tags: <strong>, <em>, <code>, <mark>
  const parts = html.split(/(<(?:strong|b|em|i|code|mark)[^>]*>[\s\S]*?<\/(?:strong|b|em|i|code|mark)>)/i)

  for (const part of parts) {
    if (!part) continue

    const boldMatch   = part.match(/^<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>$/i)
    const italicMatch = part.match(/^<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>$/i)
    const codeMatch   = part.match(/^<code[^>]*>([\s\S]*?)<\/code>$/i)
    const markMatch   = part.match(/^<mark[^>]*>([\s\S]*?)<\/mark>$/i)

    if (boldMatch) {
      const inner = stripTags(boldMatch[1])
      if (inner) segments.push({ text: inner, bold: true })
    } else if (italicMatch) {
      const inner = stripTags(italicMatch[1])
      if (inner) segments.push({ text: inner, italic: true })
    } else if (codeMatch) {
      const inner = stripTags(codeMatch[1])
      if (inner) segments.push({ text: inner, code: true })
    } else if (markMatch) {
      const inner = stripTags(markMatch[1])
      if (inner) segments.push({ text: inner, bold: true })
    } else {
      const text = stripTags(part)
      if (text) segments.push({ text })
    }
  }

  return segments.filter(s => s.text.trim())
}

export function htmlToNodes(html: string): PdfNode[] {
  const nodes: PdfNode[] = []
  if (!html) return nodes

  // Normalise whitespace
  const src = html.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  // Extract block-level elements one by one
  const blockRe = /<(h[1-6]|p|blockquote|ul|ol|hr)[^>]*>([\s\S]*?)<\/\1>|<hr\s*\/?>/gi
  let match: RegExpExecArray | null

  // Process ordered list items counting
  let olCounter = 0

  while ((match = blockRe.exec(src)) !== null) {
    const tag  = match[1]?.toLowerCase() ?? "hr"
    const inner = match[2] ?? ""

    if (tag === "hr") {
      nodes.push({ type: "divider" })
      continue
    }

    if (tag === "h2" || tag === "h3") {
      const text = stripTags(inner)
      if (text) nodes.push({ type: "heading", text, level: tag === "h2" ? 2 : 3 })
      continue
    }

    if (tag === "h1" || tag === "h4" || tag === "h5" || tag === "h6") {
      const text = stripTags(inner)
      if (text) nodes.push({ type: "heading", text, level: 2 })
      continue
    }

    if (tag === "blockquote") {
      const text = stripTags(inner)
      if (text) nodes.push({ type: "blockquote", text })
      continue
    }

    if (tag === "ul") {
      const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
      let li: RegExpExecArray | null
      while ((li = liRe.exec(inner)) !== null) {
        const text = stripTags(li[1])
        if (text) nodes.push({ type: "listitem", text, ordered: false, index: 0 })
      }
      olCounter = 0
      continue
    }

    if (tag === "ol") {
      olCounter = 0
      const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
      let li: RegExpExecArray | null
      while ((li = liRe.exec(inner)) !== null) {
        const text = stripTags(li[1])
        if (text) nodes.push({ type: "listitem", text, ordered: true, index: ++olCounter })
      }
      continue
    }

    if (tag === "p") {
      if (!inner.trim() || inner.trim() === "<br>" || inner.trim() === "<br/>") {
        nodes.push({ type: "paragraph", segments: [{ text: " " }] })
        continue
      }
      const segs = parseInline(inner)
      if (segs.length) nodes.push({ type: "paragraph", segments: segs })
      continue
    }
  }

  return nodes
}
