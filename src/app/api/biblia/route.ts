import { NextResponse } from "next/server"
import { ApiClient, BibleClient } from "@youversion/platform-core"
import { db } from "@/lib/db"

function cacheVerses(book: string, chapter: number, version: string, verses: { number: number; text: string }[]) {
  const data = verses.map(v => ({
    id:      `${version}-${book}-${chapter}-${v.number}`,
    book,
    chapter,
    verse:   v.number,
    version,
    text:    v.text,
  }))
  // fire-and-forget — never blocks the response
  db.bibleVerse.createMany({ data }).catch(() => {})
}

// YouVersion Platform — platform.youversion.com
// Available PT versions under accelerated licensing:
//   129  = NVI  (Nova Versão Internacional — BR)
//   1966 = NBV-P (Nova Bíblia Viva)
//   3254 = BLT  (tradução livre, sem copyright)
const YV_VERSION_IDS: Record<string, number> = {
  nvi_yv: 129,
  nbvp:   1966,
  blt:    3254,
}

let yvClient: BibleClient | null = null
function getYVClient(): BibleClient {
  if (!yvClient) {
    yvClient = new BibleClient(new ApiClient({ appKey: process.env.YOUVERSION_APP_KEY! }))
  }
  return yvClient
}

// Parses YouVersion HTML into verse objects.
// Format: <span class="yv-v" v="N"></span><span class="yv-vlbl">N</span>TEXT
function parseYVHtml(html: string): { number: number; text: string }[] {
  const verses: { number: number; text: string }[] = []
  const marker = /<span class="yv-v" v="(\d+)"><\/span><span class="yv-vlbl">\d+<\/span>/g
  const parts = html.split(marker)
  // parts: [before_v1, "1", text_v1, "2", text_v2, ...]
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
    const client = getYVClient()
    const versionId = YV_VERSION_IDS[version]
    const usfm = `${bookId}.${chapter}` // e.g. "GEN.1", "JHN.3"

    const passage = await client.getPassage(versionId, usfm, "html")
    const content = (passage as { content?: string }).content ?? ""
    const verses = parseYVHtml(content)

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

// --- BibliaOnline.com.br (NVT, NAA) ---
// Scraping SSR HTML — versículos em <span class="v"> dentro de <article coreBibleStyles>

// nvi added here — abibliadigital.com.br returns 500 for NVI
const BIBLIA_ONLINE_VERSIONS = new Set(["nvi", "nvt", "naa"])

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&amp;/g,  "&").replace(/&lt;/g,   "<").replace(/&gt;/g,   ">")
    .replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function parseBibliaOnlineHtml(html: string): { number: number; text: string; heading?: string }[] {
  // bibliaonline.com.br structure (2025):
  //   Heading:    <div data-section="" data-v=".1.2...N." ...><span data-v=".1." ...>Text</span></div>
  //   Verse para: <p data-v=".1.2.3." ...>
  //     <span data-vb="" data-v=".1." ...></span>            ← verse start marker (empty)
  //     <span data-vn="" data-v=".1." ...>1<!-- --> </span>  ← verse number label
  //     <span data-v=".1." class="inline">text</span>        ← verse text (may repeat)
  //     <button data-note="" ...>*</button>                   ← footnote marker (ignore)
  //   </p>

  // ── Step 1: Extract section headings ────────────────────────────────────
  const headingMap = new Map<number, string>()
  const hdRe = /<div\b[^>]*\bdata-section=""[^>]*\bdata-v="([^"]+)"[^>]*>([\s\S]*?)<\/div>/gi
  let hm: RegExpExecArray | null
  while ((hm = hdRe.exec(html)) !== null) {
    const inner = hm[2].match(/<span\b[^>]*\bdata-v="\.(\d+)\."[^>]*>([\s\S]*?)<\/span>/)
    if (!inner) continue
    const num  = parseInt(inner[1])
    const text = decodeEntities(inner[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
    if (num > 0 && text) headingMap.set(num, text)
  }

  // ── Step 2: Parse verse paragraphs ──────────────────────────────────────
  const verseMap = new Map<number, string[]>()
  const pRe = /<p\b[^>]*\bdata-v="([^"]+)"[^>]*>([\s\S]*?)<\/p>/gi
  let m: RegExpExecArray | null

  while ((m = pRe.exec(html)) !== null) {
    const pContent = m[2]

    // Split paragraph by verse-break markers (data-vb="" — empty span)
    const segments = pContent.split(/<span\b[^>]*\bdata-vb=""[^>]*><\/span>/i)
    // segments[0] is before the first verse; segments[1..] each start a new verse

    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i]

      // Verse number lives in the data-vn span — capture it from data-v attribute
      const vnMatch = seg.match(/<span\b[^>]*\bdata-vn=""[^>]*\bdata-v="\.(\d+)\."/)
                   ?? seg.match(/<span\b[^>]*\bdata-v="\.(\d+)\."[^>]*\bdata-vn=""/)
      if (!vnMatch) continue
      const num = parseInt(vnMatch[1])
      if (!num || num <= 0) continue

      // Remove the data-vn span entirely, then collect text from data-v spans
      const afterNum = seg.replace(/<span\b[^>]*\bdata-vn=""[^>]*>[\s\S]*?<\/span>/, "")

      const textParts: string[] = []
      const tRe = /<span\b[^>]*\bdata-v="[^"]*"[^>]*>([\s\S]*?)<\/span>/gi
      let tm: RegExpExecArray | null
      while ((tm = tRe.exec(afterNum)) !== null) {
        const t = decodeEntities(tm[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
        if (t) textParts.push(t)
      }

      // Fallback: strip all tags and use raw text
      if (textParts.length === 0) {
        const raw = decodeEntities(afterNum.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
        if (raw) textParts.push(raw)
      }

      if (textParts.length === 0) continue
      if (!verseMap.has(num)) verseMap.set(num, [])
      verseMap.get(num)!.push(textParts.join(" "))
    }
  }

  // ── Step 3: Build result, attaching headings to the first verse of each section
  return Array.from(verseMap.entries())
    .filter(([, parts]) => parts.length > 0)
    .map(([number, parts]) => ({
      number,
      text: parts.join(" "),
      ...(headingMap.has(number) ? { heading: headingMap.get(number) } : {}),
    }))
    .sort((a, b) => a.number - b.number)
}

async function fetchFromBibliaOnline(bookId: string, chapter: string, version: string) {
  const abbr = ABBR_MAP[bookId]
  if (!abbr) return NextResponse.json({ error: "Livro inválido" }, { status: 400 })

  const url = `https://www.bibliaonline.com.br/${version}/${encodeURIComponent(abbr)}/${chapter}`

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      console.error("[biblia/bibliaonline] upstream error", { status: res.status, version, book: bookId, chapter })
      return NextResponse.json({ error: "API_ERROR", detail: `HTTP ${res.status}` }, { status: res.status })
    }

    const html = await res.text()
    const verses = parseBibliaOnlineHtml(html)

    if (verses.length === 0) {
      console.error("[biblia/bibliaonline] No verses parsed", { version, book: bookId, chapter, htmlLength: html.length })
      return NextResponse.json({ error: "API_ERROR", detail: "Nenhum versículo encontrado no HTML" }, { status: 502 })
    }

    cacheVerses(bookId, parseInt(chapter), version, verses)
    return NextResponse.json({ verses, version, book: bookId, chapter: parseInt(chapter) })
  } catch (err) {
    console.error("[biblia/bibliaonline] Network error:", err)
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 })
  }
}

// --- AbibliaDigital (NVI, ACF, RA) ---

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const bookId  = searchParams.get("book") ?? ""
  const chapter = searchParams.get("chapter") ?? "1"
  const version = searchParams.get("version") ?? "nvi"

  if (version in YV_VERSION_IDS) {
    return fetchFromYouVersion(bookId, chapter, version)
  }

  if (BIBLIA_ONLINE_VERSIONS.has(version)) {
    return fetchFromBibliaOnline(bookId, chapter, version)
  }

  const abbr = ABBR_MAP[bookId]
  if (!abbr) return NextResponse.json({ error: "Livro inválido" }, { status: 400 })

  const token = process.env.BIBLE_API_TOKEN
  const hasToken = Boolean(token && token.length > 10 && token !== "COLE_AQUI_SEU_TOKEN")

  const url = `https://www.abibliadigital.com.br/api/verses/${version}/${encodeURIComponent(abbr)}/${chapter}`

  const headers: HeadersInit = {
    "Accept": "application/json",
    ...(hasToken && { "Authorization": `Bearer ${token}` }),
  }

  try {
    const res = await fetch(url, { headers, cache: "no-store" })

    if (res.status === 429) {
      return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 })
    }
    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: "AUTH_REQUIRED", version }, { status: 401 })
    }
    if (!res.ok) {
      console.error("[biblia] upstream error", { status: res.status, version, book: bookId, chapter })
      return NextResponse.json({ error: "API_ERROR", detail: `HTTP ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    const verses = (data.verses ?? []).map((v: { number: number; text: string }) => ({
      number: v.number,
      text: v.text,
    }))

    cacheVerses(bookId, parseInt(chapter), version, verses)
    return NextResponse.json({ verses, version, book: bookId, chapter: parseInt(chapter) })
  } catch (err) {
    console.error("[biblia] Network error:", err)
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 })
  }
}
