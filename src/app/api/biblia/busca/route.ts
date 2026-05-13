import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// Maps USFM book IDs to Portuguese full names
const BOOK_NAMES: Record<string, string> = {
  GEN: "Gênesis",     EXO: "Êxodo",       LEV: "Levítico",    NUM: "Números",    DEU: "Deuteronômio",
  JOS: "Josué",       JDG: "Juízes",      RUT: "Rute",        "1SA": "1 Samuel", "2SA": "2 Samuel",
  "1KI": "1 Reis",    "2KI": "2 Reis",    "1CH": "1 Crônicas","2CH": "2 Crônicas",
  EZR: "Esdras",      NEH: "Neemias",     EST: "Ester",       JOB: "Jó",         PSA: "Salmos",
  PRO: "Provérbios",  ECC: "Eclesiastes", SNG: "Cânticos",    ISA: "Isaías",     JER: "Jeremias",
  LAM: "Lamentações", EZK: "Ezequiel",    DAN: "Daniel",      HOS: "Oséias",     JOL: "Joel",
  AMO: "Amós",        OBA: "Obadias",     JON: "Jonas",       MIC: "Miquéias",   NAH: "Naum",
  HAB: "Habacuque",   ZEP: "Sofonias",    HAG: "Ageu",        ZEC: "Zacarias",   MAL: "Malaquias",
  MAT: "Mateus",      MRK: "Marcos",      LUK: "Lucas",       JHN: "João",       ACT: "Atos",
  ROM: "Romanos",     "1CO": "1 Coríntios","2CO": "2 Coríntios",GAL: "Gálatas",  EPH: "Efésios",
  PHP: "Filipenses",  COL: "Colossenses", "1TH": "1 Tessalonicenses","2TH": "2 Tessalonicenses",
  "1TI": "1 Timóteo", "2TI": "2 Timóteo", TIT: "Tito",       PHM: "Filemom",    HEB: "Hebreus",
  JAS: "Tiago",       "1PE": "1 Pedro",   "2PE": "2 Pedro",
  "1JN": "1 João",    "2JN": "2 João",    "3JN": "3 João",
  JUD: "Judas",       REV: "Apocalipse",
}

// Internal versions stored in the cache (keyed by what the Bible reader uses)
const KNOWN_VERSIONS = ["nvi", "nvt", "naa", "nvi_yv", "nbvp"]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q       = (searchParams.get("q") ?? "").trim()
  const version = searchParams.get("version") ?? "nvi"

  if (!q) {
    const indexedCount = await db.bibleVerse.count({ where: { version } }).catch(() => 0)
    return NextResponse.json({ results: [], total: 0, indexedCount })
  }

  try {
    const rows = await db.bibleVerse.findMany({
      where: {
        version,
        text: { contains: q },
      },
      orderBy: [{ book: "asc" }, { chapter: "asc" }, { verse: "asc" }],
      take: 60,
    })

    const results = rows.map(r => ({
      bookName: BOOK_NAMES[r.book] ?? r.book,
      bookId:   r.book,
      chapter:  r.chapter,
      verse:    r.verse,
      text:     r.text,
    }))

    // Count total matches (without the limit)
    const total = await db.bibleVerse.count({
      where: { version, text: { contains: q } },
    })

    return NextResponse.json({ results, total })
  } catch (err) {
    console.error("[busca/internal] DB error:", err)
    return NextResponse.json({ error: "Erro ao buscar versículos.", results: [] }, { status: 500 })
  }
}
