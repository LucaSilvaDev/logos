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
  // bibliaonline.com.br structure (redesigned 2025):
  //   Heading:     <div data-section="" data-v=".1.2...N." ...><span data-v=".1." ...>Heading</span></div>
  //   Verse break: <span data-vb="" data-v=".N." ...></span>
  //   Verse num:   <span data-vn="" data-v=".N." ...>N<!-- --> </span>
  //   Verse text:  <span data-v=".N." ...>actual text</span>  (no data-vb, no data-vn)
  //   PLACEHOLDER_DO_NOT_MATCH← bookmark anchor, marks verse start
  //   <span class="v">N</span>          ← verse number label
  //   <span class="t">verse text</span> ← actual text (may be multiple spans per verse)
  // Section headings: <div data-v=".N.M..." class="s l0"> or "s l1"
  //   The first verse number in data-v is the verse the heading precedes.

  // ── Step 1: Extract section headings ────────────────────────────────────
  const headingMap = new Map<number, string>()
  const hdRe = /<div\b[^>]*\bdata-v="([^"]+)"[^>]*\bclass="([^"]*)"[^>]*>([\s\S]*?)<\/div>/gi
  let hm: RegExpExecArray | null
  while ((hm = hdRe.exec(html)) !== null) {
    const cls = hm[2]
    if (!cls.split(/\s+/).includes("s")) continue
    const nums = [...hm[1].matchAll(/(\d+)/g)].map(n => parseInt(n[1]))
    if (nums.length === 0) continue
    const text = decodeEntities(hm[3].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
    if (text) headingMap.set(nums[0], text)
  }

  // ── Step 2: Parse verse paragraphs ──────────────────────────────────────
  // bibliaonline.com.br uses two distinct structures:
  //   • Prose: one <p data-v=".3.4.5."> may contain multiple verses, each
  //     preceded by <span class="bv"> + <span class="v">N</span>.
  //   • Poetry/quotation: each line is its own <p data-v=".49.">, only the
  //     first line has the bv marker; the rest are plain continuation <p>s.
  // We handle both: bv-paragraphs use the split approach; continuation
  // paragraphs fall back to data-v for the verse number.
  const verseMap = new Map<number, string[]>()
  const pRe = /<p\b[^>]*\bdata-v="([^"]+)"[^>]*>([\s\S]*?)<\/p>/gi
  let m: RegExpExecArray | null

  while ((m = pRe.exec(html)) !== null) {
    const dataV   = m[1]
    const pContent = m[2]
    const hasBV   = /<span\b[^>]*\bclass="bv"/.test(pContent)

    if (hasBV) {
      // Prose: split by bookmark anchors — each marks the start of a new verse
      const segments = pContent.split(/<span\b[^>]*\bclass="bv"[^>]*><\/span>/gi)

      // Segment 0: text BEFORE the first bv marker — continuation of the verse
      // whose number is given by the span's own data-v (e.g. <span data-v=".1." class="t">)
      // or falls back to the first number in the paragraph's data-v attribute.
      const seg0 = segments[0]
      if (seg0) {
        const tRe0 = /<span\b[^>]*\bclass="t"[^>]*>([\s\S]*?)<\/span>/gi
        let tm0: RegExpExecArray | null
        while ((tm0 = tRe0.exec(seg0)) !== null) {
          const t = decodeEntities(tm0[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
          if (!t) continue
          // Prefer the span's own data-v, fall back to paragraph data-v
          const spanDV = tm0[0].match(/\bdata-v="([^"]+)"/)
          const dvSrc  = spanDV ? spanDV[1] : dataV
          const nm     = dvSrc.match(/\.(\d+)\./)
          if (!nm) continue
          const num = parseInt(nm[1])
          if (!num || num <= 0) continue
          if (!verseMap.has(num)) verseMap.set(num, [])
          verseMap.get(num)!.push(t)
        }
      }

      for (let i = 1; i < segments.length; i++) {
        const seg = segments[i]

        const numMatch = seg.match(/<span\b[^>]*\bclass="v"[^>]*>([\s\S]*?)<\/span>/)
        if (!numMatch) continue
        const numStr = numMatch[1].replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "").trim()
        const num = parseInt(numStr)
        if (!num || num <= 0) continue

        const textHtml = seg.replace(/<span\b[^>]*\bclass="v"[^>]*>[\s\S]*?<\/span>/, "")
        const text = decodeEntities(textHtml.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
        if (!text) continue

        if (!verseMap.has(num)) verseMap.set(num, [])
        verseMap.get(num)!.push(text)
      }
    } else {
      // Poetry continuation: no bv marker — verse number comes from data-v
      const dvMatch = dataV.match(/\.(\d+)\./)
      if (!dvMatch) continue
      const num = parseInt(dvMatch[1])
      if (!num || num <= 0) continue

      // Collect all <span class="t"> text lines from this paragraph
      const tRe = /<span\b[^>]*\bclass="t"[^>]*>([\s\S]*?)<\/span>/gi
      let tm: RegExpExecArray | null
      const lineTexts: string[] = []
      while ((tm = tRe.exec(pContent)) !== null) {
        const t = decodeEntities(tm[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
        if (t) lineTexts.push(t)
      }
      // Fallback: if no class="t" spans found, try extracting any text content
      if (lineTexts.length === 0) {
        const raw = decodeEntities(pContent.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
        if (raw) lineTexts.push(raw)
      }
      if (lineTexts.length === 0) continue
      if (!verseMap.has(num)) verseMap.set(num, [])
      for (const t of lineTexts) verseMap.get(num)!.push(t)
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
