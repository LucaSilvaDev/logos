import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Heart, Plus, CheckCircle2, Lock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PrayerCard } from "./PrayerCard"

const APOSTOLIC_PRAYERS = [
  {
    ref: "João 17:1,5",
    author: "Jesus Cristo — Oração Sacerdotal",
    text: "Pai, a hora é chegada; glorifica o teu Filho, para que o teu Filho te glorifique a ti... E agora glorifica-me tu, ó Pai, junto de ti mesmo, com aquela glória que eu tinha junto de ti antes que o mundo existisse.",
  },
  {
    ref: "Efésios 3:16–19",
    author: "Paulo — Oração pela Igreja em Éfeso",
    text: "Que vos conceda, segundo as riquezas da sua glória, que sejais corroborados com poder pelo seu Espírito no homem interior; que Cristo habite pela fé em vossos corações... para que sejais cheios de toda a plenitude de Deus.",
  },
  {
    ref: "Filipenses 1:9–11",
    author: "Paulo — Oração pelos Filipenses",
    text: "E peço isto em oração: que o vosso amor aumente mais e mais em pleno conhecimento e em toda percepção, para que aprovais as coisas excelentes e sejais puros e inculpáveis para o dia de Cristo.",
  },
  {
    ref: "Colossenses 1:9–11",
    author: "Paulo — Oração pelos Colossenses",
    text: "Não cessamos de orar por vós e de pedir que sejais cheios do pleno conhecimento da sua vontade, em toda sabedoria e entendimento espiritual, para que andeis de modo digno do Senhor, em tudo agradando-lhe.",
  },
  {
    ref: "Efésios 1:17–19",
    author: "Paulo — Oração pelo Espírito de Sabedoria",
    text: "Que o Deus de nosso Senhor Jesus Cristo, o Pai da glória, vos dê espírito de sabedoria e de revelação no pleno conhecimento dele, iluminados os olhos do vosso coração, para saberdes qual é a esperança do seu chamamento.",
  },
  {
    ref: "Neemias 1:5–6",
    author: "Neemias — Súplica pelo Povo",
    text: "Ah! Senhor Deus dos céus, o grande e temível Deus, que guarda a aliança e a misericórdia para com os que o amam e guardam os seus mandamentos... Confesso os pecados dos filhos de Israel que contra ti cometemos.",
  },
  {
    ref: "Habacuque 3:2",
    author: "Habacuque — Clamor por Avivamento",
    text: "Senhor, ouvi o teu renome, e me atemorizei. Ó Senhor, reaviva a tua obra no meio dos anos; no meio dos anos faze-a conhecida; na tua ira lembra-te da misericórdia.",
  },
]

const REFORMED_PRAYERS = [
  { author: "João Calvino", text: "Senhor, ilumina nossa mente pelo Espírito Santo, para que entendamos Tua Santa Palavra, e que o que ouvimos seja transformado em obediência na nossa vida.", source: "Oração diária" },
  { author: "João Knox", text: "Dá-me a Escócia, ou morrerei. Senhor, levanta o estandarte da Tua Palavra e que os Teus eleitos não temam.", source: "Súplica por avivamento" },
  { author: "Matthew Henry", text: "Que possamos ir ao Senhor em oração como crianças vão ao pai: com confiança, com amor, com franqueza, com total dependência.", source: "Commentaries" },
  { author: "Thomas Watson", text: "Senhor, que minha oração seja como incenso diante de Ti — que suba ao céu perfumada pela intercessão de Cristo, meu Sumo Sacerdote.", source: "The Lord's Prayer" },
  { author: "Spurgeon", text: "Grandíssimo Deus, que nossa oração não seja uma liturgia vazia, mas o clamor genuíno de almas que necessitam de Ti em tudo.", source: "Morning and Evening" },
  { author: "Jonathan Edwards", text: "Deus de toda graça, que o mesmo poder que ressuscitou Cristo dos mortos opere em nossos corações para que desejemos somente a Tua glória.", source: "Personal Narrative" },
  { author: "John Owen", text: "Ó Senhor, que eu possa conhecer-Te como Tu me conheces. Que minha alma descanse somente em Ti, o único Deus verdadeiro e eterno.", source: "Comunhão com Deus" },
  { author: "Samuel Rutherford", text: "Senhor Jesus, Tu és o porto seguro da minha alma. Que eu ancore toda esperança em Ti e não nas ondas incertas deste mundo.", source: "Cartas de Samuel Rutherford" },
  { author: "Martinho Lutero", text: "Senhor Deus, Tu és minha força e minha rocha. Que eu pregue Tua Palavra com coragem, mesmo que os portões do inferno se levantem contra ela.", source: "Oração de Worms, 1521" },
  { author: "George Whitefield", text: "Ó Deus, faz que eu seja usado para a extensão do Teu reino. Não me poupes — usa-me completamente para a Tua glória.", source: "Diário pessoal" },
  { author: "João Calvino", text: "Senhor, oferecemos nossos corações a Ti prontamente e sinceramente. Que toda nossa vida seja um sacrifício vivo ao Teu louvor.", source: "Lema pessoal" },
  { author: "R.C. Sproul", text: "Santo, Santo, Santo és Tu, Senhor. Que a visão da Tua santidade nos esmague e nos levante ao mesmo tempo.", source: "A Santidade de Deus" },
]

export default async function OracoesPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const [personal, answered] = await Promise.all([
    db.prayer.findMany({ where: { userId, answered: false }, orderBy: { createdAt: "desc" } }),
    db.prayer.findMany({ where: { userId, answered: true }, orderBy: { answeredAt: "desc" }, take: 5 }),
  ])

  // Oração da hora — muda a cada hora, determinístico
  const hour = new Date().getHours()
  const prayerOfHour = REFORMED_PRAYERS[hour % REFORMED_PRAYERS.length]

  return (
    <div className="max-w-2xl mx-auto px-2 py-8 space-y-8 animate-fade-in">

      <div className="flex items-end justify-between">
        <div>
          <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em] mb-1">Comunhão com Deus</p>
          <h1 className="font-serif text-3xl text-[#e2d9c5] font-normal">Orações</h1>
          <p className="text-[#55524a] text-xs mt-1">
            {personal.length} ativa{personal.length !== 1 ? "s" : ""} · {answered.length} respondida{answered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/oracoes/nova"
          className="flex items-center gap-1.5 text-sm text-[#c9a654] hover:opacity-80 transition-opacity font-serif">
          <Plus className="w-4 h-4" /> Nova oração
        </Link>
      </div>

      <div className="h-px bg-[#2e2b42]" />

      {/* Oração da hora */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.25em]">Oração da Hora</p>
          <span className="text-[9px] text-[#3d3a55] font-sans">· muda a cada hora</span>
        </div>
        <div className="card-soft relative pl-6 pr-5 py-5">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#c9a654] to-transparent opacity-50 rounded-l-full" />
          <blockquote className="font-serif text-[#8a8375] text-sm leading-relaxed italic mb-3">
            &ldquo;{prayerOfHour.text}&rdquo;
          </blockquote>
          <p className="text-[#c9a654] text-xs font-medium">{prayerOfHour.author}</p>
          <p className="text-[#3d3a55] text-[10px] mt-0.5">{prayerOfHour.source}</p>
        </div>
      </section>

      {/* Minhas orações — privadas */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.25em]">Minhas Orações</p>
          <span className="flex items-center gap-1 text-[9px] text-[#3d3a55]">
            <Lock className="w-2.5 h-2.5" /> privadas
          </span>
        </div>
        {personal.length === 0 ? (
          <div className="text-center py-10">
            <Heart className="w-5 h-5 text-[#2e2b42] mx-auto mb-3" />
            <p className="font-serif text-[#55524a]">Nenhuma oração registrada</p>
            <Link href="/oracoes/nova"
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#c9a654] hover:opacity-80 transition-opacity font-serif">
              <Plus className="w-3.5 h-3.5" /> Adicionar oração
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {personal.map((p: { id: string; title: string; content: string; category: string; createdAt: Date }) => (
              <PrayerCard key={p.id} prayer={p} />
            ))}
          </div>
        )}
      </section>

      {/* Respondidas */}
      {answered.length > 0 && (
        <section className="space-y-3">
          <p className="font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.25em]">Respondidas</p>
          <div className="space-y-2">
            {answered.map((p: { id: string; title: string; answeredAt: Date | null }) => (
              <div key={p.id} className="card-soft flex items-center gap-3 px-4 py-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5a9e72] opacity-60 flex-shrink-0" />
                <span className="font-serif text-[#8a8375] text-sm flex-1">{p.title}</span>
                {p.answeredAt && (
                  <span className="text-[#3d3a55] text-xs">
                    {format(new Date(p.answeredAt), "d MMM", { locale: ptBR })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Orações Bíblicas Apostólicas */}
      <section className="space-y-4">
        <div className="h-px bg-[#2e2b42]" />
        <div className="flex items-center gap-2">
          <p className="font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.25em]">Orações Bíblicas</p>
          <span className="text-[9px] text-[#3d3a55]">· dos apóstolos e profetas</span>
        </div>
        <div className="space-y-4">
          {APOSTOLIC_PRAYERS.map((q, i) => (
            <div key={i} className="card-soft relative pl-6 pr-5 py-4">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#c9a654] to-transparent opacity-40 rounded-l-full" />
              <p className="font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.2em] mb-2">{q.ref}</p>
              <blockquote className="font-serif text-[#8a8375] text-sm leading-relaxed italic mb-2">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <p className="text-[#c9a654] text-xs font-medium">{q.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nuvem de Testemunhas */}
      <section className="space-y-4">
        <div className="h-px bg-[#2e2b42]" />
        <p className="font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.25em]">Nuvem de Testemunhas</p>
        <div className="space-y-6">
          {REFORMED_PRAYERS.map((q, i) => (
            <div key={i} className="relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#c9a654] opacity-20" />
              <blockquote className="font-serif text-[#8a8375] text-sm leading-relaxed italic mb-2">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <p className="text-[#c9a654] text-xs font-medium">{q.author}</p>
              {q.source && <p className="text-[#3d3a55] text-[10px] mt-0.5">{q.source}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
