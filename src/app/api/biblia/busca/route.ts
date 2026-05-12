import { NextResponse } from "next/server"

// AbibliaDigital only has NVI content — NAA and NVT return 0 results
const SEARCHABLE = new Set(["nvi"])

// Maps AbibliaDigital Portuguese abbreviations back to USFM book IDs
const ABBR_TO_ID: Record<string, string> = {
  gn: "GEN", ex: "EXO", lv: "LEV", nm: "NUM", dt: "DEU",
  js: "JOS", jz: "JDG", rt: "RUT", "1sm": "1SA", "2sm": "2SA",
  "1rs": "1KI", "2rs": "2KI", "1cr": "1CH", "2cr": "2CH",
  ed: "EZR", ne: "NEH", et: "EST", "jó": "JOB", sl: "PSA",
  pv: "PRO", ec: "ECC", ct: "SNG", is: "ISA", jr: "JER",
  lm: "LAM", ez: "EZK", dn: "DAN", os: "HOS", jl: "JOL",
  am: "AMO", ob: "OBA", jn: "JON", mq: "MIC", na: "NAH",
  hc: "HAB", sf: "ZEP", ag: "HAG", zc: "ZEC", ml: "MAL",
  mt: "MAT", mc: "MRK", lc: "LUK", jo: "JHN", at: "ACT",
  rm: "ROM", "1co": "1CO", "2co": "2CO", gl: "GAL", ef: "EPH",
  fp: "PHP", cl: "COL", "1ts": "1TH", "2ts": "2TH",
  "1tm": "1TI", "2tm": "2TI", tt: "TIT", fm: "PHM", hb: "HEB",
  tg: "JAS", "1pe": "1PE", "2pe": "2PE",
  "1jo": "1JN", "2jo": "2JN", "3jo": "3JN",
  jd: "JUD", ap: "REV",
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q       = (searchParams.get("q") ?? "").trim()
  const version = searchParams.get("version") ?? "nvi"

  if (!q) return NextResponse.json({ results: [] })

  if (!SEARCHABLE.has(version)) {
    return NextResponse.json({
      error: "Busca disponível apenas para NVI e NAA",
      results: [],
    })
  }

  const token    = process.env.BIBLE_API_TOKEN
  const hasToken = Boolean(token && token.length > 10 && token !== "COLE_AQUI_SEU_TOKEN")

  // AbibliaDigital: POST /api/verses/search with {version, search}
  const url = "https://www.abibliadigital.com.br/api/verses/search"

  const headers: HeadersInit = {
    "Accept":       "application/json",
    "Content-Type": "application/json",
    ...(hasToken && { "Authorization": `Bearer ${token}` }),
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body:  JSON.stringify({ version, search: q }),
      cache: "no-store",
    })

    if (res.status === 429) {
      return NextResponse.json({ error: "Limite de requisições atingido. Aguarde e tente novamente.", results: [] }, { status: 429 })
    }
    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: "Busca requer autenticação. Verifique BIBLE_API_TOKEN no Vercel.", results: [] }, { status: 401 })
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.error("[busca] HTTP %d body=%s", res.status, body.slice(0, 300))
      return NextResponse.json({ error: `Erro ${res.status} da API.`, results: [] }, { status: res.status })
    }

    const data = await res.json()

    const results = (data.verses ?? []).slice(0, 60).map((v: {
      book: { name: string; abbrev: { pt: string } }
      chapter: number
      number:  number
      text:    string
    }) => ({
      bookName: v.book.name,
      bookId:   ABBR_TO_ID[v.book.abbrev.pt] ?? "",
      chapter:  v.chapter,
      verse:    v.number,
      text:     v.text,
    })).filter((r: { bookId: string }) => r.bookId !== "")

    return NextResponse.json({ results, total: data.occurrence ?? results.length })
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR", results: [] }, { status: 502 })
  }
}
