// Fonte única de verdade para categorias literárias dos 66 livros da Bíblia.
// Usada na página de Leitura (/biblia) e de Estudo (/estudo).

export const BOOK_CATEGORIES: Record<string, { color: string; label: string; desc: string }> = {
  law:              { color: "#c9a654", label: "Lei — Pentateuco",   desc: "Criação do mundo, chamado dos patriarcas e as leis fundamentais dadas a Israel por Moisés." },
  history_at:       { color: "#6b8fa8", label: "História",           desc: "Conquista da terra prometida, período dos juízes e a história da monarquia de Israel e Judá." },
  poetry:           { color: "#a87b9c", label: "Poesia e Sabedoria", desc: "Adoração, filosofia e sabedoria prática — dos Salmos ao Cântico dos Cânticos." },
  major_prophets:   { color: "#4a7a5a", label: "Grandes Profetas",   desc: "Profecias extensas de Isaías a Daniel — julgamento, esperança e promessas messiânicas." },
  minor_prophets:   { color: "#7aaa82", label: "Profetas Menores",   desc: "Doze livros mais curtos — de Oséias a Malaquias — mensagens de juízo e restauração." },
  gospels:          { color: "#7a6aaa", label: "Evangelhos",         desc: "A vida, morte e ressurreição de Jesus Cristo narrada por quatro perspectivas distintas." },
  history_nt:       { color: "#6b8fa8", label: "Hist. da Igreja",    desc: "O nascimento da Igreja primitiva e as viagens missionárias narradas em Atos." },
  paul_letters:     { color: "#c4783a", label: "Cartas de Paulo",    desc: "Ensino doutrinário e prático enviado por Paulo às igrejas do Mediterrâneo." },
  pastoral_letters: { color: "#c4783a", label: "Cartas Pastorais",   desc: "Orientação sobre liderança, ordem eclesiástica e sã doutrina nas igrejas locais." },
  general_letters:  { color: "#c4783a", label: "Cartas Gerais",      desc: "Cartas apostólicas sobre fé viva, perseverança e combate ao erro doutrinário." },
  prophecy:         { color: "#c9a654", label: "Profecia",           desc: "Apocalipse: visões do fim dos tempos, juízo final e a vitória definitiva de Cristo." },
}

export const AT_GROUPS = [
  { category: "law",            label: "Lei — Pentateuco",   ids: ["GEN","EXO","LEV","NUM","DEU"] },
  { category: "history_at",     label: "História",           ids: ["JOS","JDG","RUT","1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH","EST"] },
  { category: "poetry",         label: "Poesia e Sabedoria", ids: ["JOB","PSA","PRO","ECC","SNG"] },
  { category: "major_prophets", label: "Grandes Profetas",   ids: ["ISA","JER","LAM","EZK","DAN"] },
  { category: "minor_prophets", label: "Profetas Menores",   ids: ["HOS","JOL","AMO","OBA","JON","MIC","NAH","HAB","ZEP","HAG","ZEC","MAL"] },
]

export const NT_GROUPS = [
  { category: "gospels",          label: "Evangelhos",        ids: ["MAT","MRK","LUK","JHN"] },
  { category: "history_nt",       label: "Hist. da Igreja",   ids: ["ACT"] },
  { category: "paul_letters",     label: "Cartas de Paulo",   ids: ["ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH"] },
  { category: "pastoral_letters", label: "Cartas Pastorais",  ids: ["1TI","2TI","TIT","PHM"] },
  { category: "general_letters",  label: "Cartas Gerais",     ids: ["HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD"] },
  { category: "prophecy",         label: "Profecia",          ids: ["REV"] },
]

export function getBookCategory(bookId: string) {
  return [...AT_GROUPS, ...NT_GROUPS].find(g => g.ids.includes(bookId)) ?? null
}
