import React from "react"
import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer"
import { htmlToNodes } from "./html-to-nodes"
import type { PdfNode, PdfSegment } from "./html-to-nodes"

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  bg:       "#f5ede0",
  text:     "#1e140a",
  muted:    "#6b5a47",
  gold:     "#7a4f0a",
  border:   "#d6c4a8",
  quote:    "#5c3d1a",
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    paddingVertical: 60,
    paddingHorizontal: 72,
    fontFamily: "Times-Roman",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 36,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  appName: {
    fontSize: 8,
    color: C.gold,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  headerMeta: {
    fontSize: 8,
    color: C.muted,
    fontFamily: "Times-Italic",
  },
  typeLabel: {
    fontSize: 8,
    color: C.gold,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    color: C.text,
    fontFamily: "Times-Bold",
    lineHeight: 1.3,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 28,
  },
  metaText: {
    fontSize: 9,
    color: C.muted,
    fontFamily: "Times-Italic",
  },
  metaGold: {
    fontSize: 9,
    color: C.gold,
    fontFamily: "Times-Italic",
  },
  dividerFull: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    marginVertical: 20,
  },
  dividerShort: {
    width: 40,
    borderBottomWidth: 1,
    borderBottomColor: C.gold,
    marginVertical: 16,
  },
  h2: {
    fontSize: 14,
    color: C.text,
    fontFamily: "Times-Bold",
    marginTop: 18,
    marginBottom: 6,
  },
  h3: {
    fontSize: 11,
    color: C.muted,
    fontFamily: "Times-BoldItalic",
    marginTop: 12,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 11,
    color: C.text,
    lineHeight: 1.7,
    marginBottom: 10,
    fontFamily: "Times-Roman",
  },
  bold: {
    fontFamily: "Times-Bold",
  },
  italic: {
    fontFamily: "Times-Italic",
  },
  boldItalic: {
    fontFamily: "Times-BoldItalic",
  },
  code: {
    fontFamily: "Courier",
    fontSize: 9.5,
    backgroundColor: "#ecdcc6",
  },
  blockquote: {
    borderLeftWidth: 2,
    borderLeftColor: C.gold,
    paddingLeft: 12,
    marginVertical: 8,
    marginLeft: 8,
  },
  blockquoteText: {
    fontSize: 11,
    color: C.quote,
    fontFamily: "Times-Italic",
    lineHeight: 1.6,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 5,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 11,
    color: C.gold,
    marginRight: 6,
    width: 12,
    fontFamily: "Times-Roman",
  },
  listText: {
    flex: 1,
    fontSize: 11,
    color: C.text,
    lineHeight: 1.6,
    fontFamily: "Times-Roman",
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 72,
    right: 72,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7.5,
    color: C.border,
    letterSpacing: 1,
  },
  pageNumber: {
    fontSize: 8,
    color: C.muted,
  },
})

// ── Inline segment renderer ───────────────────────────────────────────────────
function renderSegments(segments: PdfSegment[]) {
  return segments.map((seg, i) => {
    let style = s.paragraph
    if (seg.bold && seg.italic) style = { ...s.paragraph, ...s.boldItalic }
    else if (seg.bold)   style = { ...s.paragraph, ...s.bold }
    else if (seg.italic) style = { ...s.paragraph, ...s.italic }
    else if (seg.code)   style = { ...s.paragraph, ...s.code }
    return <Text key={i} style={style}>{seg.text}</Text>
  })
}

// ── Node renderer ─────────────────────────────────────────────────────────────
function renderNode(node: PdfNode, i: number) {
  switch (node.type) {
    case "heading":
      return <Text key={i} style={node.level === 2 ? s.h2 : s.h3}>{node.text}</Text>

    case "paragraph":
      return (
        <Text key={i} style={s.paragraph}>
          {renderSegments(node.segments)}
        </Text>
      )

    case "blockquote":
      return (
        <View key={i} style={s.blockquote}>
          <Text style={s.blockquoteText}>{node.text}</Text>
        </View>
      )

    case "listitem":
      return (
        <View key={i} style={s.listItem}>
          <Text style={s.bullet}>{node.ordered ? `${node.index}.` : "·"}</Text>
          <Text style={s.listText}>{node.text}</Text>
        </View>
      )

    case "divider":
      return <View key={i} style={s.dividerFull} />
  }
}

// ── Document ─────────────────────────────────────────────────────────────────

export interface SelahDocumentProps {
  type:    "devocional" | "estudo"
  title:   string
  content: string
  meta: {
    label?:   string
    ref?:     string
    date?:    string
    tags?:    string[]
  }
}

export function SelahDocument({ type, title, content, meta }: SelahDocumentProps) {
  const nodes = htmlToNodes(content)
  const typeLabel = type === "devocional" ? "Devocional" : meta.label ?? "Nota de Estudo"

  return (
    <Document
      title={title}
      author="Selah"
      creator="Selah — Sistema Devocional"
      language="pt-BR"
    >
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header} fixed>
          <Text style={s.appName}>Selah</Text>
          {meta.date && <Text style={s.headerMeta}>{meta.date}</Text>}
        </View>

        {/* ── Title block ── */}
        <Text style={s.typeLabel}>{typeLabel}</Text>
        <Text style={s.title}>{title}</Text>

        <View style={s.metaRow}>
          {meta.ref && <Text style={s.metaGold}>{meta.ref}</Text>}
          {meta.tags && meta.tags.length > 0 && (
            <Text style={s.metaText}>{meta.tags.map(t => `#${t}`).join("  ")}</Text>
          )}
        </View>

        <View style={s.dividerShort} />

        {/* ── Content ── */}
        {nodes.map((node, i) => renderNode(node, i))}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>SELAH · Pausa · Medita · Contempla</Text>
          <Text style={s.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
