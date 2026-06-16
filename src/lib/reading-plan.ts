type Book = [string, number] // [name, chapters]

// Canonical 66-book list — single source of truth for id/name/chapters/testament.
// AT/NT/BOOK_CHAPTERS/BOOK_ID_NAMES/ALL_BOOK_NAMES below are all derived from this.
export const BOOKS: { id: string; name: string; chapters: number; testament: "AT" | "NT" }[] = [
  { id: "GEN", name: "Gênesis", chapters: 50, testament: "AT" },
  { id: "EXO", name: "Êxodo", chapters: 40, testament: "AT" },
  { id: "LEV", name: "Levítico", chapters: 27, testament: "AT" },
  { id: "NUM", name: "Números", chapters: 36, testament: "AT" },
  { id: "DEU", name: "Deuteronômio", chapters: 34, testament: "AT" },
  { id: "JOS", name: "Josué", chapters: 24, testament: "AT" },
  { id: "JDG", name: "Juízes", chapters: 21, testament: "AT" },
  { id: "RUT", name: "Rute", chapters: 4, testament: "AT" },
  { id: "1SA", name: "1 Samuel", chapters: 31, testament: "AT" },
  { id: "2SA", name: "2 Samuel", chapters: 24, testament: "AT" },
  { id: "1KI", name: "1 Reis", chapters: 22, testament: "AT" },
  { id: "2KI", name: "2 Reis", chapters: 25, testament: "AT" },
  { id: "1CH", name: "1 Crônicas", chapters: 29, testament: "AT" },
  { id: "2CH", name: "2 Crônicas", chapters: 36, testament: "AT" },
  { id: "EZR", name: "Esdras", chapters: 10, testament: "AT" },
  { id: "NEH", name: "Neemias", chapters: 13, testament: "AT" },
  { id: "EST", name: "Ester", chapters: 10, testament: "AT" },
  { id: "JOB", name: "Jó", chapters: 42, testament: "AT" },
  { id: "PSA", name: "Salmos", chapters: 150, testament: "AT" },
  { id: "PRO", name: "Provérbios", chapters: 31, testament: "AT" },
  { id: "ECC", name: "Eclesiastes", chapters: 12, testament: "AT" },
  { id: "SNG", name: "Cânticos", chapters: 8, testament: "AT" },
  { id: "ISA", name: "Isaías", chapters: 66, testament: "AT" },
  { id: "JER", name: "Jeremias", chapters: 52, testament: "AT" },
  { id: "LAM", name: "Lamentações", chapters: 5, testament: "AT" },
  { id: "EZK", name: "Ezequiel", chapters: 48, testament: "AT" },
  { id: "DAN", name: "Daniel", chapters: 12, testament: "AT" },
  { id: "HOS", name: "Oséias", chapters: 14, testament: "AT" },
  { id: "JOL", name: "Joel", chapters: 3, testament: "AT" },
  { id: "AMO", name: "Amós", chapters: 9, testament: "AT" },
  { id: "OBA", name: "Obadias", chapters: 1, testament: "AT" },
  { id: "JON", name: "Jonas", chapters: 4, testament: "AT" },
  { id: "MIC", name: "Miquéias", chapters: 7, testament: "AT" },
  { id: "NAH", name: "Naum", chapters: 3, testament: "AT" },
  { id: "HAB", name: "Habacuque", chapters: 3, testament: "AT" },
  { id: "ZEP", name: "Sofonias", chapters: 3, testament: "AT" },
  { id: "HAG", name: "Ageu", chapters: 2, testament: "AT" },
  { id: "ZEC", name: "Zacarias", chapters: 14, testament: "AT" },
  { id: "MAL", name: "Malaquias", chapters: 4, testament: "AT" },
  { id: "MAT", name: "Mateus", chapters: 28, testament: "NT" },
  { id: "MRK", name: "Marcos", chapters: 16, testament: "NT" },
  { id: "LUK", name: "Lucas", chapters: 24, testament: "NT" },
  { id: "JHN", name: "João", chapters: 21, testament: "NT" },
  { id: "ACT", name: "Atos", chapters: 28, testament: "NT" },
  { id: "ROM", name: "Romanos", chapters: 16, testament: "NT" },
  { id: "1CO", name: "1 Coríntios", chapters: 16, testament: "NT" },
  { id: "2CO", name: "2 Coríntios", chapters: 13, testament: "NT" },
  { id: "GAL", name: "Gálatas", chapters: 6, testament: "NT" },
  { id: "EPH", name: "Efésios", chapters: 6, testament: "NT" },
  { id: "PHP", name: "Filipenses", chapters: 4, testament: "NT" },
  { id: "COL", name: "Colossenses", chapters: 4, testament: "NT" },
  { id: "1TH", name: "1 Tessalonicenses", chapters: 5, testament: "NT" },
  { id: "2TH", name: "2 Tessalonicenses", chapters: 3, testament: "NT" },
  { id: "1TI", name: "1 Timóteo", chapters: 6, testament: "NT" },
  { id: "2TI", name: "2 Timóteo", chapters: 4, testament: "NT" },
  { id: "TIT", name: "Tito", chapters: 3, testament: "NT" },
  { id: "PHM", name: "Filemom", chapters: 1, testament: "NT" },
  { id: "HEB", name: "Hebreus", chapters: 13, testament: "NT" },
  { id: "JAS", name: "Tiago", chapters: 5, testament: "NT" },
  { id: "1PE", name: "1 Pedro", chapters: 5, testament: "NT" },
  { id: "2PE", name: "2 Pedro", chapters: 3, testament: "NT" },
  { id: "1JN", name: "1 João", chapters: 5, testament: "NT" },
  { id: "2JN", name: "2 João", chapters: 1, testament: "NT" },
  { id: "3JN", name: "3 João", chapters: 1, testament: "NT" },
  { id: "JUD", name: "Judas", chapters: 1, testament: "NT" },
  { id: "REV", name: "Apocalipse", chapters: 22, testament: "NT" },
]

const AT: Book[] = BOOKS.filter(b => b.testament === "AT").map(b => [b.name, b.chapters])
const NT: Book[] = BOOKS.filter(b => b.testament === "NT").map(b => [b.name, b.chapters])

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

export const BOOK_CHAPTERS: Record<string, number> = Object.fromEntries(BOOKS.map(b => [b.id, b.chapters]))

export const BOOK_ID_NAMES: Record<string, string> = Object.fromEntries(BOOKS.map(b => [b.id, b.name]))

export const ALL_BOOK_NAMES: string[] = BOOKS.map(b => b.name)

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
