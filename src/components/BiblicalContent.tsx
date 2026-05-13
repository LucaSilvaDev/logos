"use client"

import { useRouter } from "next/navigation"
import { useMemo } from "react"

// Maps Portuguese book abbreviations to USFM IDs
const BOOK_ABBR: Record<string, string> = {
  gn: "GEN", ex: "EXO", lv: "LEV", nm: "NUM", dt: "DEU",
  js: "JOS", jz: "JDG", rt: "RUT",
  "1sm": "1SA", "2sm": "2SA", "1rs": "1KI", "2rs": "2KI",
  "1cr": "1CH", "2cr": "2CH", ed: "EZR", ne: "NEH", et: "EST",
  jó: "JOB",
  sl: "PSA", pv: "PRO", ec: "ECC", ct: "SNG",
  is: "ISA", jr: "JER", lm: "LAM", ez: "EZK", dn: "DAN",
  os: "HOS", jl: "JOL", am: "AMO", ob: "OBA", jn: "JON",
  mq: "MIC", na: "NAH", hc: "HAB", sf: "ZEP", ag: "HAG",
  zc: "ZEC", ml: "MAL",
  mt: "MAT", mc: "MRK", lc: "LUK", jo: "JHN", at: "ACT",
  rm: "ROM", "1co": "1CO", "2co": "2CO", gl: "GAL", ef: "EPH",
  fp: "PHP", cl: "COL", "1ts": "1TH", "2ts": "2TH",
  "1tm": "1TI", "2tm": "2TI", tt: "TIT", fm: "PHM", hb: "HEB",
  tg: "JAS", "1pe": "1PE", "2pe": "2PE",
  "1jo": "1JN", "2jo": "2JN", "3jo": "3JN",
  jd: "JUD", ap: "REV",
  // Full name shortcuts
  gênesis: "GEN", genesis: "GEN", êxodo: "EXO", exodo: "EXO",
  levítico: "LEV", números: "NUM", deuteronômio: "DEU",
  josué: "JOS", juízes: "JDG", rute: "RUT", salmos: "PSA",
  mateus: "MAT", marcos: "MRK", lucas: "LUK", joão: "JHN",
  atos: "ACT", romanos: "ROM", tiago: "JAS", judas: "JUD",
  apocalipse: "REV", hebreus: "HEB",
}

// Matches: @Sl 23:1, @João 3:16, @Rm 8:1, @1Co 13:4-7
const VERSE_RE = /(@)([\w\dÀ-ú]+)\s+(\d+):(\d+)(?:-\d+)?/gi

// Matches: [[Note title]]
const NOTE_RE = /\[\[([^\]]+)\]\]/g

function processHtml(html: string): string {
  // Replace verse refs
  let out = html.replace(VERSE_RE, (match, _at, book, chapter) => {
    const bookId = BOOK_ABBR[book.toLowerCase()]
    if (!bookId) return match
    const pos = encodeURIComponent(JSON.stringify({ bookId, chapter: parseInt(chapter), version: "nvi" }))
    return `<a href="/biblia" data-bible-pos="${pos}" class="bible-link">${book} ${chapter}:${match.split(":")[1]?.match(/\d+/)?.[0] ?? ""}</a>`
  })

  // Replace note links
  out = out.replace(NOTE_RE, (_m, title) => {
    return `<a href="/estudo?q=${encodeURIComponent(title)}" class="note-link">[[${title}]]</a>`
  })

  return out
}

interface Props {
  html: string
  className?: string
}

export function BiblicalContent({ html, className }: Props) {
  const router = useRouter()
  const processed = useMemo(() => processHtml(html), [html])

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    const link = target.closest("a[data-bible-pos]")
    if (link) {
      e.preventDefault()
      const pos = link.getAttribute("data-bible-pos")
      if (pos) {
        try { localStorage.setItem("selah-bible-pos", decodeURIComponent(pos)) } catch { /* ignore */ }
        router.push("/biblia")
      }
    }
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: processed }}
      onClick={handleClick}
    />
  )
}
