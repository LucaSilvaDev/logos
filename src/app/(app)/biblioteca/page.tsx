import { BookOpen } from "lucide-react"

const TULIP = [
  {
    letter: "T",
    title: "Depravação Total",
    latin: "Totus Depravatio",
    desc: "O pecado afeta cada aspecto do ser humano — intelecto, vontade, emoções. O homem não busca a Deus por si mesmo; é espiritualmente morto.",
    refs: ["Gênesis 6:5", "Jeremias 17:9", "Romanos 3:10–18", "Efésios 2:1–3"],
  },
  {
    letter: "U",
    title: "Eleição Incondicional",
    latin: "Electio Incondicionalis",
    desc: "Deus escolhe Seu povo não com base em fé ou obras previstas, mas somente por Sua boa vontade e misericórdia soberana antes da fundação do mundo.",
    refs: ["Efésios 1:4–5", "Romanos 9:11–16", "João 15:16", "2 Timóteo 1:9"],
  },
  {
    letter: "L",
    title: "Expiação Particular",
    latin: "Expiatio Limitata",
    desc: "Cristo morreu intencionalmente para salvar com certeza Seus eleitos. Seu sangue realmente expía e garante a salvação de todos pelos quais foi derramado.",
    refs: ["João 10:11,15", "Efésios 5:25", "Isaías 53:8", "João 17:9"],
  },
  {
    letter: "I",
    title: "Graça Irresistível",
    latin: "Gratia Irresistibilis",
    desc: "O Espírito Santo opera eficazmente no coração dos eleitos, vencendo sua resistência e inclinando a vontade para que venham a Cristo de bom grado.",
    refs: ["João 6:37,44", "Filipenses 2:13", "Ezequiel 36:26–27", "Atos 13:48"],
  },
  {
    letter: "P",
    title: "Perseverança dos Santos",
    latin: "Perseverantia Sanctorum",
    desc: "Os verdadeiramente regenerados são guardados por Deus e perseveram na fé até o fim. Não pela força humana, mas pelo poder de Deus que os sustenta.",
    refs: ["João 10:28–29", "Filipenses 1:6", "Romanos 8:38–39", "1 Pedro 1:5"],
  },
]

const WESTMINSTER = [
  { cap: "I",      title: "Das Sagradas Escrituras", summary: "A Bíblia é a única regra infalível de fé e prática. Nela Deus revelou completamente Sua vontade para a salvação." },
  { cap: "II",     title: "De Deus e da Santíssima Trindade", summary: "Há um só Deus vivo e verdadeiro, eterno, infinito, perfeito em toda santidade. Três pessoas: Pai, Filho e Espírito Santo." },
  { cap: "III",    title: "Do Decreto Eterno de Deus", summary: "Deus decretou soberanamente tudo o que acontece, para Sua própria glória, sem ser autor do pecado." },
  { cap: "VI",     title: "Da Queda do Homem, do Pecado", summary: "Adão transgrediu e caiu. Toda a humanidade pecou nele. Todos nascem com natureza corrompida." },
  { cap: "VIII",   title: "De Cristo, o Mediador", summary: "O Filho eterno assumiu natureza humana, sendo verdadeiro Deus e verdadeiro homem. Cumpriu a lei e expiou o pecado." },
  { cap: "X",      title: "Da Vocação Eficaz", summary: "Todos os eleitos são eficazmente chamados pelo Espírito, iluminados e renovados, vindo a Cristo livremente." },
  { cap: "XI",     title: "Da Justificação", summary: "Deus declara justos os eleitos, imputando a justiça de Cristo. A justificação é pela fé somente, não pelas obras." },
  { cap: "XVII",   title: "Da Perseverança dos Santos", summary: "Os que são chamados e justificados perseveram na graça até o fim. Nunca cairão totalmente da graça salvadora." },
  { cap: "XXV",    title: "Da Igreja", summary: "A Igreja universal inclui todos os eleitos de todos os tempos. A Igreja visível é o reino do Senhor Jesus Cristo no mundo." },
  { cap: "XXXIII", title: "Do Juízo Final", summary: "Deus fixou um dia para julgar o mundo por Cristo. Os justos herdarão a vida eterna; os ímpios, o castigo eterno." },
]

const QUOTES = [
  { author: "João Calvino",    text: "Nossa sabedoria consiste em duas partes: o conhecimento de Deus e o conhecimento de nós mesmos.", source: "Institutas, I.1.1" },
  { author: "Jonathan Edwards",text: "A resolução de não fazer coisa alguma por motivo de timidez, mas somente para a glória de Deus é o grande princípio do qual todos os outros devem fluir.", source: "Resoluções" },
  { author: "John Owen",       text: "Mortifiquem o pecado ou ele os matará.", source: "Da Mortificação do Pecado" },
  { author: "R.C. Sproul",     text: "Deus não está tentando fazer o melhor de uma situação difícil. Deus é o Senhor soberano da história.", source: "A Santidade de Deus" },
  { author: "Spurgeon",        text: "Há mais misericórdia em Cristo do que pecado em mim.", source: "Sermões" },
  { author: "John Piper",      text: "Deus é mais glorificado em nós quando somos mais satisfeitos Nele.", source: "Desiring God" },
  { author: "Thomas Watson",   text: "O pecado é o inferno em miniatura.", source: "A Body of Divinity" },
  { author: "J.I. Packer",     text: "A humildade não é pensar menos de si mesmo, mas pensar em si mesmo com menos frequência.", source: "Knowing God" },
]

const SOLAS = [
  { sola: "Sola Scriptura",  desc: "Somente a Escritura" },
  { sola: "Sola Fide",       desc: "Somente a Fé" },
  { sola: "Sola Gratia",     desc: "Somente a Graça" },
  { sola: "Solus Christus",  desc: "Somente Cristo" },
  { sola: "Soli Deo Gloria", desc: "Somente a Glória de Deus" },
]

const CREDO_APOSTOLICO = [
  "Creio em Deus Pai todo-poderoso, criador do céu e da terra.",
  "E em Jesus Cristo, seu único Filho, nosso Senhor;",
  "que foi concebido pelo Espírito Santo, nasceu da Virgem Maria,",
  "padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado;",
  "desceu ao hades; ao terceiro dia ressurgiu dos mortos;",
  "subiu ao céu, está sentado à destra de Deus Pai todo-poderoso;",
  "donde há de vir a julgar os vivos e os mortos.",
  "Creio no Espírito Santo, na santa Igreja universal,",
  "na comunhão dos santos, no perdão dos pecados,",
  "na ressurreição do corpo, na vida eterna.",
  "Amém.",
]

const CREDO_NICENO = [
  "Creio em um só Deus, Pai todo-poderoso, criador do céu e da terra, de todas as coisas visíveis e invisíveis.",
  "E em um só Senhor Jesus Cristo, Filho unigênito de Deus, nascido do Pai antes de todos os séculos;",
  "Deus de Deus, Luz de Luz, Deus verdadeiro de Deus verdadeiro; gerado, não criado, consubstancial ao Pai.",
  "Por ele todas as coisas foram feitas.",
  "Por nós, homens, e para nossa salvação desceu dos céus,",
  "e se encarnou pelo Espírito Santo no seio da Virgem Maria e se fez homem.",
  "Também por nós foi crucificado sob Pôncio Pilatos; padeceu e foi sepultado.",
  "Ressuscitou ao terceiro dia, conforme as Escrituras.",
  "Subiu ao céu e está sentado à destra do Pai.",
  "E de novo há de vir em glória para julgar os vivos e os mortos; e o seu reino não terá fim.",
  "E no Espírito Santo, Senhor que dá a vida, que procede do Pai,",
  "que com o Pai e o Filho é adorado e glorificado, e que falou pelos profetas.",
  "Na Igreja una, santa, universal e apostólica.",
  "Professamos um só batismo para a remissão dos pecados.",
  "Esperamos a ressurreição dos mortos e a vida do século vindouro.",
  "Amém.",
]

export default function BibliotecaPage() {
  return (
    <div className="max-w-3xl mx-auto px-2 py-8 space-y-12 animate-fade-in">

      <div>
        <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em] mb-1">Teologia Reformada</p>
        <h1 className="font-serif text-3xl text-[#e2d9c5] font-normal">Biblioteca</h1>
        <p className="text-[#55524a] text-xs mt-1">Credo · TULIP · Westminster · Citações Reformadas</p>
      </div>

      <div className="h-px bg-[#3a2b1c]" />

      {/* Credos */}
      <section className="space-y-8">
        <div>
          <p className="font-display text-[9px] text-[#4a3826] uppercase tracking-[0.25em] mb-1">Confissões Ecumênicas</p>
          <h2 className="font-serif text-xl text-[#c9c0a8]">Os Credos da Igreja</h2>
        </div>

        {/* Credo Apostólico */}
        <div className="card-soft relative px-6 py-6">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#c9a654] to-transparent opacity-60 rounded-l-full" />
          <div className="mb-4">
            <p className="font-display text-[9px] text-[#4a3826] uppercase tracking-[0.25em] mb-0.5">Século II · Universal</p>
            <h3 className="font-serif text-[#c9c0a8] text-base">Credo Apostólico</h3>
          </div>
          <div className="space-y-2">
            {CREDO_APOSTOLICO.map((line, i) => (
              <p key={i} className={`font-serif leading-relaxed ${
                line === "Amém."
                  ? "text-[#c9a654] text-sm font-medium mt-4"
                  : "text-[#8a8375] text-sm"
              }`}>
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Credo Niceno */}
        <div className="card-soft relative px-6 py-6">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#c9a654] to-transparent opacity-60 rounded-l-full" />
          <div className="mb-4">
            <p className="font-display text-[9px] text-[#4a3826] uppercase tracking-[0.25em] mb-0.5">381 d.C. · Concílio de Constantinopla</p>
            <h3 className="font-serif text-[#c9c0a8] text-base">Credo Niceno-Constantinopolitano</h3>
          </div>
          <div className="space-y-2">
            {CREDO_NICENO.map((line, i) => (
              <p key={i} className={`font-serif leading-relaxed ${
                line === "Amém."
                  ? "text-[#c9a654] text-sm font-medium mt-4"
                  : "text-[#8a8375] text-sm"
              }`}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-[#3a2b1c]" />

      {/* TULIP */}
      <section className="space-y-6">
        <div>
          <p className="font-display text-[9px] text-[#4a3826] uppercase tracking-[0.25em] mb-1">Os 5 Pontos do Calvinismo</p>
          <h2 className="font-serif text-xl text-[#c9c0a8]">TULIP</h2>
        </div>

        <div className="space-y-3">
          {TULIP.map(point => (
            <div key={point.letter} className="card-soft py-5 px-5 flex gap-6">
              <div className="font-display text-4xl text-[#c9a654] opacity-30 leading-none flex-shrink-0 w-10 text-right">
                {point.letter}
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-[#c9c0a8] text-base mb-0.5">{point.title}</h3>
                <p className="text-[#4a3826] text-[10px] italic mb-3 font-serif">{point.latin}</p>
                <p className="text-[#8a8375] text-sm leading-relaxed mb-4">{point.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {point.refs.map(ref => (
                    <span key={ref} className="flex items-center gap-1 text-[10px] text-[#55524a] font-serif italic">
                      <BookOpen className="w-2.5 h-2.5 text-[#4a3826]" />{ref}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Westminster */}
      <section className="space-y-6">
        <div>
          <p className="font-display text-[9px] text-[#4a3826] uppercase tracking-[0.25em] mb-1">1646</p>
          <h2 className="font-serif text-xl text-[#c9c0a8]">Confissão de Westminster</h2>
        </div>

        <div className="space-y-2">
          {WESTMINSTER.map(ch => (
            <div key={ch.cap} className="card-soft py-4 px-4 flex gap-4">
              <span className="font-mono text-[10px] text-[#4a3826] flex-shrink-0 w-8 text-right pt-0.5">
                {ch.cap}
              </span>
              <div>
                <h3 className="font-serif text-[#8a8375] text-sm mb-1">{ch.title}</h3>
                <p className="text-[#55524a] text-xs leading-relaxed">{ch.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Citações */}
      <section className="space-y-6">
        <div>
          <p className="font-display text-[9px] text-[#4a3826] uppercase tracking-[0.25em] mb-1">Nuvem de Testemunhas</p>
          <h2 className="font-serif text-xl text-[#c9c0a8]">Citações Reformadas</h2>
        </div>

        <div className="space-y-8">
          {QUOTES.map((q, i) => (
            <div key={i} className="relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#c9a654] opacity-20" />
              <blockquote className="font-serif text-[#8a8375] text-sm leading-relaxed italic mb-2">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <p className="text-[#c9a654] text-xs font-medium">{q.author}</p>
              {q.source && <p className="text-[#4a3826] text-[10px] mt-0.5">{q.source}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Solas */}
      <section className="space-y-4">
        <div className="h-px bg-[#3a2b1c]" />
        <p className="font-display text-[9px] text-[#4a3826] uppercase tracking-[0.25em]">As 5 Solas da Reforma</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {SOLAS.map(s => (
            <div key={s.sola} className="card-soft p-4 text-center">
              <p className="font-display text-[10px] text-[#c9a654] opacity-70 tracking-wider uppercase mb-1">{s.sola}</p>
              <p className="text-[#55524a] text-[10px]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
