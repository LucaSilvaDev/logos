import { NextResponse } from "next/server"
import { ApiClient, BibleClient } from "@youversion/platform-core"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

type Verse = { number: number; text: string }

function jsonChapter(
  verses: Verse[],
  version: string,
  book: string,
  chapter: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ verses, version, book, chapter, ...extra })
}

function cacheVerses(book: string, chapter: number, version: string, verses: Verse[]) {
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

async function tryCache(bookId: string, chapter: string, version: string) {
  const chapterNum = parseInt(chapter, 10)
  if (!Number.isFinite(chapterNum) || chapterNum < 1) return null
  try {
    const cached = await readFromCache(bookId, chapterNum, version)
    if (cached) return jsonChapter(cached, version, bookId, chapterNum, { cached: true, source: "cache" })
  } catch (err) {
    console.error("[biblia/cache] read failed", err)
  }
  return null
}

// ─── YouVersion Platform (NVI) ────────────────────────────────────────────────
// platform.youversion.com — NVI aprovado (id=129)
// NVT e NAA: licença pendente → bibliaonline.com.br
// YouVersion usa NAM para Naum; o app usa NAH em todo o restante.

const YV_NVI_ID = 129
const YV_BOOK_ALIAS: Record<string, string> = { NAH: "NAM" }

function toYouVersionUsfm(bookId: string, chapter: string) {
  return `${YV_BOOK_ALIAS[bookId] ?? bookId}.${chapter}`
}

let yvClient: BibleClient | null = null
function getYVClient(): BibleClient {
  if (!yvClient) {
    yvClient = new BibleClient(new ApiClient({ appKey: process.env.YOUVERSION_APP_KEY! }))
  }
  return yvClient
}

// Parses YouVersion HTML: <span class="yv-v" v="N"></span><span class="yv-vlbl">N</span>TEXT
function parseYVHtml(html: string): Verse[] {
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

async function fetchFromYouVersion(bookId: string, chapter: string) {
  const appKey = process.env.YOUVERSION_APP_KEY
  if (!appKey || appKey === "COLE_AQUI_SEU_APP_KEY") {
    return NextResponse.json({ error: "AUTH_REQUIRED", version: "nvi" }, { status: 401 })
  }

  const usfm = toYouVersionUsfm(bookId, chapter)

  try {
    const client  = getYVClient()
    const passage = await client.getPassage(YV_NVI_ID, usfm, "html")
    const content = (passage as { content?: string }).content ?? ""
    const verses  = parseYVHtml(content)

    if (verses.length === 0) {
      console.error("[biblia/youversion] Empty verses", { usfm, contentLength: content.length })
      return NextResponse.json({ error: "API_ERROR", detail: "Nenhum versículo retornado" }, { status: 502 })
    }

    cacheVerses(bookId, parseInt(chapter), "nvi", verses)
    return jsonChapter(verses, "nvi", bookId, parseInt(chapter), { source: "youversion" })
  } catch (err) {
    console.error("[biblia/youversion] Error:", err)
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 })
  }
}

// ─── BibliaOnline (NVT, NAA, fallback NVI) ────────────────────────────────────
// Scraping de www.bibliaonline.com.br
// Estrutura: data-vb="" data-v=".N." marca início de versículo

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

function parseBibliaOnlineHtml(html: string): Verse[] {
  const verseRe = /data-v="\.(\d+)\."/g
  const starts: { num: number; idx: number }[] = []
  let m: RegExpExecArray | null
  verseRe.lastIndex = 0
  while ((m = verseRe.exec(html)) !== null) {
    starts.push({ num: parseInt(m[1]), idx: m.index })
  }
  if (starts.length === 0) return []

  const verseMap = new Map<number, string[]>()

  for (let i = 0; i < starts.length; i++) {
    const segStart = starts[i].idx
    const segEnd   = i + 1 < starts.length ? starts[i + 1].idx : html.length
    let   segment  = html.slice(segStart, segEnd)

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
    if (num > 0 && text.length > 0) {
      if (!verseMap.has(num)) verseMap.set(num, [])
      verseMap.get(num)!.push(text)
    }
  }

  return Array.from(verseMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([number, parts]) => ({ number, text: parts.join(" ") }))
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
    return jsonChapter(verses, version, bookId, parseInt(chapter), { source: "bibliaonline" })
  } catch (err) {
    console.error("[biblia/bibliaonline] Network error:", err)
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 })
  }
}

const SUPPORTED_VERSIONS = new Set(["nvi", "naa", "nvt"])

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const bookId  = searchParams.get("book") ?? ""
  const chapter = searchParams.get("chapter") ?? "1"
  const version = (searchParams.get("version") ?? "nvi").toLowerCase()

  if (!SUPPORTED_VERSIONS.has(version)) {
    return NextResponse.json(
      { error: "VERSION_UNSUPPORTED", detail: "Use nvi, naa ou nvt" },
      { status: 400 },
    )
  }

  const cached = await tryCache(bookId, chapter, version)
  if (cached) return cached

  if (version === "nvi") {
    const yv = await fetchFromYouVersion(bookId, chapter)
    if (yv.ok) return yv
    console.warn("[biblia] YouVersion falhou, tentando BibliaOnline", { bookId, chapter, status: yv.status })
    return fetchFromBibliaOnline(bookId, chapter, "nvi")
  }

  return fetchFromBibliaOnline(bookId, chapter, version)
}
