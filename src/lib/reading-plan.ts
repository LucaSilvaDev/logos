type Book = [string, number] // [name, chapters]

const AT: Book[] = [
  ["Gênesis", 50], ["Êxodo", 40], ["Levítico", 27], ["Números", 36], ["Deuteronômio", 34],
  ["Josué", 24], ["Juízes", 21], ["Rute", 4], ["1 Samuel", 31], ["2 Samuel", 24],
  ["1 Reis", 22], ["2 Reis", 25], ["1 Crônicas", 29], ["2 Crônicas", 36], ["Esdras", 10],
  ["Neemias", 13], ["Ester", 10], ["Jó", 42], ["Salmos", 150], ["Provérbios", 31],
  ["Eclesiastes", 12], ["Cânticos", 8], ["Isaías", 66], ["Jeremias", 52], ["Lamentações", 5],
  ["Ezequiel", 48], ["Daniel", 12], ["Oséias", 14], ["Joel", 3], ["Amós", 9],
  ["Obadias", 1], ["Jonas", 4], ["Miquéias", 7], ["Naum", 3], ["Habacuque", 3],
  ["Sofonias", 3], ["Ageu", 2], ["Zacarias", 14], ["Malaquias", 4],
]

const NT: Book[] = [
  ["Mateus", 28], ["Marcos", 16], ["Lucas", 24], ["João", 21], ["Atos", 28],
  ["Romanos", 16], ["1 Coríntios", 16], ["2 Coríntios", 13], ["Gálatas", 6],
  ["Efésios", 6], ["Filipenses", 4], ["Colossenses", 4], ["1 Tessalonicenses", 5],
  ["2 Tessalonicenses", 3], ["1 Timóteo", 6], ["2 Timóteo", 4], ["Tito", 3],
  ["Filemom", 1], ["Hebreus", 13], ["Tiago", 5], ["1 Pedro", 5], ["2 Pedro", 3],
  ["1 João", 5], ["2 João", 1], ["3 João", 1], ["Judas", 1], ["Apocalipse", 22],
]

export const PLAN_CONFIG: Record<string, { label: string; days: number; books: Book[] }> = {
  "1y":    { label: "Bíblia — 1 Ano",              days: 365, books: [...AT, ...NT] },
  "6m":    { label: "Bíblia — 6 Meses",             days: 180, books: [...AT, ...NT] },
  "nt-3m": { label: "Novo Testamento — 3 Meses",    days: 90,  books: NT },
  "nt-1m": { label: "Novo Testamento — 1 Mês",      days: 30,  books: NT },
  "ot-1y": { label: "Antigo Testamento — 1 Ano",    days: 365, books: AT },
  "ot-6m": { label: "Antigo Testamento — 6 Meses",  days: 180, books: AT },
  "salmos": { label: "Salmos — 1 Mês",              days: 30,  books: [["Salmos", 150]] },
  "evang":  { label: "Evangelhos — 40 Dias",        days: 40,  books: [["Mateus",28],["Marcos",16],["Lucas",24],["João",21]] },
}

function chapterToRef(books: Book[], globalIdx: number): { book: string; ch: number } {
  let rem = Math.max(0, globalIdx)
  for (const [name, count] of books) {
    if (rem < count) return { book: name, ch: rem + 1 }
    rem -= count
  }
  const last = books[books.length - 1]
  return { book: last[0], ch: last[1] }
}

export const BOOK_CHAPTERS: Record<string, number> = {
  GEN:50,  EXO:40,  LEV:27,  NUM:36,  DEU:34,  JOS:24,  JDG:21,  RUT:4,
  "1SA":31,"2SA":24,"1KI":22,"2KI":25,"1CH":29,"2CH":36, EZR:10, NEH:13,
  EST:10,  JOB:42,  PSA:150, PRO:31,  ECC:12,  SNG:8,   ISA:66,  JER:52,
  LAM:5,   EZK:48,  DAN:12,  HOS:14,  JOL:3,   AMO:9,   OBA:1,   JON:4,
  MIC:7,   NAH:3,   HAB:3,   ZEP:3,   HAG:2,   ZEC:14,  MAL:4,
  MAT:28,  MRK:16,  LUK:24,  JHN:21,  ACT:28,  ROM:16,
  "1CO":16,"2CO":13, GAL:6,  EPH:6,   PHP:4,   COL:4,
  "1TH":5, "2TH":3, "1TI":6,"2TI":4,  TIT:3,   PHM:1,   HEB:13,
  JAS:5,   "1PE":5, "2PE":3, "1JN":5, "2JN":1, "3JN":1, JUD:1,   REV:22,
}

export const BOOK_ID_NAMES: Record<string, string> = {
  GEN: "Gênesis",  EXO: "Êxodo",       LEV: "Levítico",     NUM: "Números",       DEU: "Deuteronômio",
  JOS: "Josué",    JDG: "Juízes",       RUT: "Rute",         "1SA": "1 Samuel",    "2SA": "2 Samuel",
  "1KI": "1 Reis", "2KI": "2 Reis",     "1CH": "1 Crônicas", "2CH": "2 Crônicas",  EZR: "Esdras",
  NEH: "Neemias",  EST: "Ester",        JOB: "Jó",           PSA: "Salmos",        PRO: "Provérbios",
  ECC: "Eclesiastes", SNG: "Cânticos",  ISA: "Isaías",       JER: "Jeremias",      LAM: "Lamentações",
  EZK: "Ezequiel", DAN: "Daniel",       HOS: "Oséias",       JOL: "Joel",          AMO: "Amós",
  OBA: "Obadias",  JON: "Jonas",        MIC: "Miquéias",     NAH: "Naum",          HAB: "Habacuque",
  ZEP: "Sofonias", HAG: "Ageu",         ZEC: "Zacarias",     MAL: "Malaquias",
  MAT: "Mateus",   MRK: "Marcos",       LUK: "Lucas",        JHN: "João",          ACT: "Atos",
  ROM: "Romanos",  "1CO": "1 Coríntios","2CO": "2 Coríntios", GAL: "Gálatas",      EPH: "Efésios",
  PHP: "Filipenses", COL: "Colossenses","1TH": "1 Tessalonicenses", "2TH": "2 Tessalonicenses",
  "1TI": "1 Timóteo", "2TI": "2 Timóteo", TIT: "Tito",       PHM: "Filemom",       HEB: "Hebreus",
  JAS: "Tiago",    "1PE": "1 Pedro",    "2PE": "2 Pedro",    "1JN": "1 João",      "2JN": "2 João",
  "3JN": "3 João", JUD: "Judas",        REV: "Apocalipse",
}

export const ALL_BOOK_NAMES: string[] = [...AT, ...NT].map(([name]) => name)

export function getPassage(planType: string, day: number): string {
  const config = PLAN_CONFIG[planType]
  if (!config) return `Dia ${day}`

  const totalCh = config.books.reduce((s, [, n]) => s + n, 0)
  const chPerDay = totalCh / config.days

  const startIdx = Math.floor((day - 1) * chPerDay)
  const endIdx   = Math.min(Math.ceil(day * chPerDay) - 1, totalCh - 1)

  const start = chapterToRef(config.books, startIdx)
  const end   = chapterToRef(config.books, endIdx)

  if (start.book === end.book) {
    if (start.ch === end.ch) return `${start.book} ${start.ch}`
    return `${start.book} ${start.ch}–${end.ch}`
  }
  return `${start.book} ${start.ch} — ${end.book} ${end.ch}`
}
