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
  return rows.map(r => ({ number: r.verse, text: r.text }))
}

// ─── YouVersion Platform (NVI, NVT) ──────────────────────────────────────────
// platform.youversion.com — licenciamento acelerado PT-BR
//   129  = NVI (Nova Versão Internacional — BR)
//   1930 = NVT (Nova Versão Transformadora)

const YV_VERSION_IDS: Record<string, number> = {
  nvi: 129,
  nvt: 1930,
}

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

async function fetchFromYouVersion(bookId: string, chapter: string, version: string) {
  const appKey = process.env.YOUVERSION_APP_KEY
  if (!appKey || appKey === "COLE_AQUI_SEU_APP_KEY") {
    return NextResponse.json({ error: "AUTH_REQUIRED", version }, { status: 401 })
  }

  try {
    const client  = getYVClient()
    const versionId = YV_VERSION_IDS[version]
    const usfm   = `${bookId}.${chapter}`

    const passage = await client.getPassage(versionId, usfm, "html")
    const content = (passage as { content?: string }).content ?? ""
    const verses  = parseYVHtml(content)

    if (verses.length === 0) {
      console.error("[biblia/youversion] Empty verses", { usfm, version, contentLength: content.length })
      return NextResponse.json({ error: "API_ERROR", detail: "Nenhum versículo retornado" }, { status: 502 })
    }

    cacheVerses(bookId, parseInt(chapter), version, verses)
    return NextResponse.json({ verses, version, book: bookId, chapter: parseInt(chapter) })
  } catch (err) {
    console.error("[biblia/youversion] Error:", err)
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 })
  }
}

// ─── AbibliaDigital (NAA, NVT + demais versões) ───────────────────────────────
// API REST própria — sem scraping

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

async function fetchFromAbibliaDigital(bookId: string, chapter: string, version: string) {
  const abbr = ABBR_MAP[bookId]
  if (!abbr) return NextResponse.json({ error: "Livro inválido" }, { status: 400 })

  const token    = process.env.BIBLE_API_TOKEN
  const hasToken = Boolean(token && token.length > 10 && token !== "COLE_AQUI_SEU_TOKEN")
  const url      = `https://www.abibliadigital.com.br/api/verses/${version}/${encodeURIComponent(abbr)}/${chapter}`

  // Try with token first; if rejected, retry without (token may be expired)
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

    // Token rejected — retry without auth
    if ((res.status === 401 || res.status === 403) && hasToken) {
      res = await tryFetch(false)
    }

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

  // YouVersion versions never use cache (always fresh, stable API)
  if (version in YV_VERSION_IDS) {
    return fetchFromYouVersion(bookId, chapter, version)
  }

  // For other versions: serve from DB cache when available
  try {
    const cached = await readFromCache(bookId, parseInt(chapter), version)
    if (cached) {
      return NextResponse.json({ verses: cached, version, book: bookId, chapter: parseInt(chapter), cached: true })
    }
  } catch { /* cache miss — fall through to API */ }

  return fetchFromAbibliaDigital(bookId, chapter, version)
}
