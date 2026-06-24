import { NextResponse } from "next/server"
import { ApiClient, BibleClient } from "@youversion/platform-core"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

function cacheVerses(book: string, chapter: number, version: string, verses: { number: number; text: string }[]) {
  const data = verses.map(v => ({
    id:      `${version}-${book}-${chapter}-${v.number}`,
    book,
    chapter,
    verse:   v.number,
    version,
    text:    v.text,
  }))
  db.bibleVerse.createMany({ data, skipDuplicates: true } as Parameters<typeof db.bibleVerse.createMany>[0]).catch(() => {})
}

async function readFromCache(book: string, chapter: number, version: string) {
  const rows = await db.bibleVerse.findMany({
    where: { book, chapter, version },
    orderBy: { verse: "asc" },
    select: { verse: true, text: true },
  })
  if (rows.length === 0) return null
  if (rows.some(r => !r.text || r.text.trim() === "")) return null
  return rows.map(r => ({ number: r.verse, text: r.text }))
}

// ─── YouVersion Platform (NVI) ────────────────────────────────────────────────
// platform.youversion.com — NVI aprovado (id=129)
// NVT (1930) e NAA (1840): licença pendente de aprovação → usar bibliaonline

const YV_NVI_ID = 129

let yvClient: BibleClient | null = null
function getYVClient(): BibleClient {
  if (!yvClient) {
    yvClient = new BibleClient(new ApiClient({ appKey: process.env.YOUVERSION_APP_KEY! }))
  }
  return yvClient
}

// Parses YouVersion HTML: <span class="yv-v" v="N"></span><span class="yv-vlbl">N</span>TEXT
function parseYVHtml(html: string): { number: number; text: string }[] {
  const verses: { number: number; text: string }[] = []
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

async function fetchFromYouVersion(bookId: string, chapter: string) {
  const appKey = process.env.YOUVERSION_APP_KEY
  if (!appKey || appKey === "COLE_AQUI_SEU_APP_KEY") {
    return NextResponse.json({ error: "AUTH_REQUIRED", version: "nvi" }, { status: 401 })
  }

  try {
    const client  = getYVClient()
    const usfm    = `${bookId}.${chapter}`
    const passage = await client.getPassage(YV_NVI_ID, usfm, "html")
    const content = (passage as { content?: string }).content ?? ""
    const verses  = parseYVHtml(content)

    if (verses.length === 0) {
      console.error("[biblia/youversion] Empty verses", { usfm, contentLength: content.length })
      return NextResponse.json({ error: "API_ERROR", detail: "Nenhum versículo retornado" }, { status: 502 })
    }

    cacheVerses(bookId, parseInt(chapter), "nvi", verses)
    return NextResponse.json({ verses, version: "nvi", book: bookId, chapter: parseInt(chapter) })
  } catch (err) {
    console.error("[biblia/youversion] Error:", err)
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 })
  }
}

// ─── BibliaOnline (NVT, NAA) ──────────────────────────────────────────────────
// Scraping de www.bibliaonline.com.br — suporta NVT e NAA nativamente
// Estrutura atual (2026): data-vb="" data-v=".N." marca início de versículo

const ABBR_MAP: Record<string, string> = {
  GEN: "gn",    EXO: "ex",    LEV: "lv",    NUM: "nm",    DEU: "dt",
  JOS: "js",    JDG: "jz",    RUT: "rt",    "1SA": "1sm", "2SA": "2sm",
  "1KI": "1rs", "2KI": "2rs", "1CH": "1cr", "2CH": "2cr",
  EZR: "ed",    NEH: "ne",    EST: "et",    JOB: "jó",    PSA: "sl",
  PRO: "pv",    ECC: "ec",    SNG: "ct",    ISA: "is",    JER: "jr",
  LAM: "lm",    EZK: "ez",    DAN: "dn",    HOS: "os",    JOL: "jl",
  AMO: "am",    OBA: "ob",    JON: "jn",    MIC: "mq",    NAH: "na",
  HAB: "hc",    ZEP: "sf",    HAG: "ag",    ZEC: "zc",    MAL: "ml",
  MAT: "mt",    MRK: "mc",    LUK: "lc",    JHN: "jo",    ACT: "at",
  ROM: "rm",    "1CO": "1co", "2CO": "2co", GAL: "gl",    EPH: "ef",
  PHP: "fp",    COL: "cl",    "1TH": "1ts", "2TH": "2ts",
  "1TI": "1tm", "2TI": "2tm", TIT: "tt",    PHM: "fm",    HEB: "hb",
  JAS: "tg",    "1PE": "1pe", "2PE": "2pe",
  "1JN": "1jo", "2JN": "2jo", "3JN": "3jo",
  JUD: "jd",    REV: "ap",
}

function parseBibliaOnlineHtml(html: string): { number: number; text: string }[] {
  const verses: { number: number; text: string }[] = []

  // Verse starts are marked by: data-vb="" data-v=".N."
  const verseStartRe = /data-vb="" data-v="\.(\d+)\."/g
  const starts: { num: number; idx: number }[] = []
  let m: RegExpExecArray | null
  verseStartRe.lastIndex = 0
  while ((m = verseStartRe.exec(html)) !== null) {
    starts.push({ num: parseInt(m[1]), idx: m.index })
  }

  for (let i = 0; i < starts.length; i++) {
    const segStart = starts[i].idx
    const segEnd   = i + 1 < starts.length ? starts[i + 1].idx : html.length
    let   segment  = html.slice(segStart, segEnd)

    // The regex match starts mid-tag (after <span ) — skip to past the first closing >
    segment = segment.replace(/^[^>]*>/, "")
    // Remove footnote buttons
    segment = segment.replace(/<button[^>]*data-note[^>]*>[\s\S]*?<\/button>/gi, "")
    // Remove verse-number display spans (data-vn)
    segment = segment.replace(/<span[^>]*data-vn=""[^>]*>[\s\S]*?<\/span>/gi, "")
    // Remove HTML comments (React hydration markers like <!-- -->)
    segment = segment.replace(/<!--[\s\S]*?-->/g, "")
    // Strip all remaining tags
    segment = segment.replace(/<[^>]+>/g, " ")
    // Remove incomplete tag at segment boundary (e.g. "<span" cut off)
    segment = segment.replace(/<[^>]*$/, "")
    // Decode common HTML entities
    segment = segment.replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    // Remove copyright notice that appears after the last verse
    segment = segment.replace(/\s*Copyright[©®].*$/i, "").replace(/\s*Nova Almeida Atualizada[©®].*$/i, "")
    // Collapse whitespace
    const text = segment.replace(/\s+/g, " ").trim()

    if (starts[i].num > 0 && text.length > 0) {
      verses.push({ number: starts[i].num, text })
    }
  }

  return verses
}

async function fetchFromBibliaOnline(bookId: string, chapter: string, version: string) {
  const abbr = ABBR_MAP[bookId]
  if (!abbr) return NextResponse.json({ error: "Livro inválido" }, { status: 400 })

  const url = `https://www.bibliaonline.com.br/${version}/${encodeURIComponent(abbr)}/${chapter}`

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      cache: "no-store",
    })

    if (!res.ok) {
      console.error("[biblia/bibliaonline] HTTP error", { status: res.status, version, bookId, chapter })
      return NextResponse.json({ error: "API_ERROR", detail: `HTTP ${res.status}` }, { status: 502 })
    }

    const html   = await res.text()
    const verses = parseBibliaOnlineHtml(html)

    if (verses.length === 0) {
      console.error("[biblia/bibliaonline] No verses parsed", { version, bookId, chapter, htmlLen: html.length })
      return NextResponse.json({ error: "API_ERROR", detail: "Nenhum versículo encontrado" }, { status: 502 })
    }

    cacheVerses(bookId, parseInt(chapter), version, verses)
    return NextResponse.json({ verses, version, book: bookId, chapter: parseInt(chapter) })
  } catch (err) {
    console.error("[biblia/bibliaonline] Network error:", err)
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 })
  }
}

// ─── AbibliaDigital (outras versões) ─────────────────────────────────────────

async function fetchFromAbibliaDigital(bookId: string, chapter: string, version: string) {
  const abbr = ABBR_MAP[bookId]
  if (!abbr) return NextResponse.json({ error: "Livro inválido" }, { status: 400 })

  const token    = process.env.BIBLE_API_TOKEN
  const hasToken = Boolean(token && token.length > 10 && token !== "COLE_AQUI_SEU_TOKEN")
  const url      = `https://www.abibliadigital.com.br/api/verses/${version}/${encodeURIComponent(abbr)}/${chapter}`

  const tryFetch = async (withToken: boolean) =>
    fetch(url, {
      headers: {
        "Accept": "application/json",
        ...(withToken && hasToken && { "Authorization": `Bearer ${token}` }),
      },
      cache: "no-store",
    })

  try {
    let res = await tryFetch(true)
    if ((res.status === 401 || res.status === 403) && hasToken) res = await tryFetch(false)

    if (res.status === 429) return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 })
    if (res.status === 401 || res.status === 403) return NextResponse.json({ error: "AUTH_REQUIRED", version }, { status: 401 })
    if (!res.ok) {
      console.error("[biblia/abibliadigital] upstream error", { status: res.status, version, book: bookId, chapter })
      return NextResponse.json({ error: "API_ERROR", detail: `HTTP ${res.status}` }, { status: res.status })
    }

    const data   = await res.json()
    const verses = (data.verses ?? []).map((v: { number: number; text: string }) => ({
      number: v.number,
      text:   v.text,
    }))

    cacheVerses(bookId, parseInt(chapter), version, verses)
    return NextResponse.json({ verses, version, book: bookId, chapter: parseInt(chapter) })
  } catch (err) {
    console.error("[biblia/abibliadigital] Network error:", err)
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 })
  }
}

// ─── GET handler ──────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const bookId  = searchParams.get("book") ?? ""
  const chapter = searchParams.get("chapter") ?? "1"
  const version = searchParams.get("version") ?? "nvi"

  // NVI → YouVersion (aprovado e estável)
  if (version === "nvi") {
    return fetchFromYouVersion(bookId, chapter)
  }

  // NVT, NAA → cache primeiro, depois bibliaonline.com.br
  if (version === "nvt" || version === "naa") {
    try {
      const cached = await readFromCache(bookId, parseInt(chapter), version)
      if (cached) {
        return NextResponse.json({ verses: cached, version, book: bookId, chapter: parseInt(chapter), cached: true })
      }
    } catch { /* cache miss */ }
    return fetchFromBibliaOnline(bookId, chapter, version)
  }

  // Outras versões → cache primeiro, depois abibliadigital
  try {
    const cached = await readFromCache(bookId, parseInt(chapter), version)
    if (cached) {
      return NextResponse.json({ verses: cached, version, book: bookId, chapter: parseInt(chapter), cached: true })
    }
  } catch { /* cache miss */ }

  return fetchFromAbibliaDigital(bookId, chapter, version)
}
