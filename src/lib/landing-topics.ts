export type InsightCard = {
  label: string
  title: string
  description: string
  meta: string
}

export type LandingTopic = {
  id: string
  name: string
  headline: string
  href: string
  cards: [InsightCard, InsightCard, InsightCard, InsightCard]
}

export function topicCta(href: string) {
  if (href === "/biblia") return "Abrir a Bíblia"
  if (href === "/plano") return "Abrir o plano"
  if (href === "/oracoes") return "Abrir orações"
  if (href === "/estudo") return "Abrir estudo"
  if (href === "/memorizar") return "Memorizar"
  if (href === "/devocional") return "Abrir devocional"
  return "Continuar"
}

export const LANDING_BRAND = "Selah"

export const LANDING_NAV = [
  { label: "Bíblia", href: "/biblia" },
  { label: "Devocional", href: "/devocional" },
  { label: "Estudo", href: "/estudo" },
] as const

export const LANDING_TOPICS: LandingTopic[] = [
  {
    id: "leitura",
    name: "Leitura",
    href: "/biblia",
    headline: "muda o modo como você abre o texto",
    cards: [
      {
        label: "Ritmo",
        title: "Um versículo sem pressa",
        description: "Ler pouco e voltar ao mesmo trecho forma atenção. A pressa dissolve o que a página ainda ia dizer.",
        meta: "Nota 01 · Leitura contínua",
      },
      {
        label: "Descobrir",
        title: "A frase que insiste",
        description: "O detalhe que você sublinharia duas vezes costuma ser o centro do capítulo, não o ornamento.",
        meta: "Nota 02 · Coleção de leitura",
      },
      {
        label: "Prática",
        title: "Voz baixa, página aberta",
        description: "Ler em voz alta, mesmo só para si, segura o texto no corpo e reduz o deslize automático dos olhos.",
        meta: "Nota 03 · Hábito diário",
      },
      {
        label: "Retorno",
        title: "O mesmo capítulo amanhã",
        description: "Repetir um capítulo curto revela camadas que a primeira passagem trata como cenário.",
        meta: "Nota 04 · Releitura",
      },
    ],
  },
  {
    id: "plano",
    name: "Plano",
    href: "/plano",
    headline: "sustenta o hábito sem cobrá-lo",
    cards: [
      {
        label: "Desenho",
        title: "Metas que cabem no dia",
        description: "Um plano honesto mede capítulos possíveis, não um calendário que já nasce atrasado.",
        meta: "Nota 01 · Trilha guiada",
      },
      {
        label: "Descobrir",
        title: "Continuidade visível",
        description: "Ver o ponto em que você parou ontem evita a farsa de recomeçar o livro a cada culpa.",
        meta: "Nota 02 · Progresso",
      },
      {
        label: "Prática",
        title: "Folga embutida",
        description: "Dias em branco fazem parte do desenho. O plano que não prevê pausa quebra na primeira semana difícil.",
        meta: "Nota 03 · Sustentação",
      },
      {
        label: "Retorno",
        title: "Retomar sem teatro",
        description: "Voltar ao último versículo lido é mais fiel do que fingir que a interrupção não aconteceu.",
        meta: "Nota 04 · Recuperação",
      },
    ],
  },
  {
    id: "oracao",
    name: "Oração",
    href: "/oracoes",
    headline: "abre espaço antes da palavra",
    cards: [
      {
        label: "Entrada",
        title: "Pedir ouvidos, não pressa",
        description: "Trinta segundos em silêncio mudam o que a leitura encontra. A página não compete com a lista mental.",
        meta: "Nota 01 · Preparo",
      },
      {
        label: "Descobrir",
        title: "O texto vira pedido",
        description: "Transformar um versículo em intercessão impede que ele fique só como informação acumulada.",
        meta: "Nota 02 · Resposta",
      },
      {
        label: "Prática",
        title: "Frases curtas bastam",
        description: "Oração depois da leitura não precisa de discurso. Uma frase honesta segura o que foi ouvido.",
        meta: "Nota 03 · Depois da página",
      },
      {
        label: "Retorno",
        title: "Guardar o que pediu",
        description: "Anotar o pedido ao lado do versículo cria memória: o texto e a vida deixam de andar em corredores separados.",
        meta: "Nota 04 · Registro",
      },
    ],
  },
  {
    id: "estudo",
    name: "Estudo",
    href: "/estudo",
    headline: "liga o trecho ao restante da Escritura",
    cards: [
      {
        label: "Contexto",
        title: "Quem fala, e a quem",
        description: "Antes da aplicação, o endereço: autor, ouvintes, conflito. Sem isso, o versículo vira slogan.",
        meta: "Nota 01 · Enquadramento",
      },
      {
        label: "Descobrir",
        title: "Eco em outro livro",
        description: "Uma alusão bem seguida explica mais do que três comentários soltos. A Bíblia interpreta a Bíblia.",
        meta: "Nota 02 · Cruzamento",
      },
      {
        label: "Prática",
        title: "Uma pergunta por página",
        description: "Escrever só uma dúvida honesta vale mais do que um caderno cheio de resumo sem tensão.",
        meta: "Nota 03 · Método curto",
      },
      {
        label: "Retorno",
        title: "Voltar com a dúvida",
        description: "O estudo amadurece quando a pergunta de ontem ainda está aberta, não quando tudo já tem etiqueta.",
        meta: "Nota 04 · Persistência",
      },
    ],
  },
  {
    id: "memoria",
    name: "Memória",
    href: "/memorizar",
    headline: "fica quando o dia já fechou",
    cards: [
      {
        label: "Escolha",
        title: "Poucos versículos, bem",
        description: "Decorar um corredor inteiro cansa. Um versículo que você usa de verdade permanece.",
        meta: "Nota 01 · Seleção",
      },
      {
        label: "Descobrir",
        title: "Repetir no caminho",
        description: "A memória segura o texto no intervalo — fila, caminhada, espera — onde o aplicativo não está aberto.",
        meta: "Nota 02 · Recitação",
      },
      {
        label: "Prática",
        title: "Dizer sem olhar",
        description: "Fechar a tela e falar o versículo revela o que ainda é só reconhecimento visual.",
        meta: "Nota 03 · Prova simples",
      },
      {
        label: "Retorno",
        title: "Revisar o que esqueceu",
        description: "O esquecimento não é falha moral. É o sinal de que aquele texto pede outra passagem, mais lenta.",
        meta: "Nota 04 · Revisão",
      },
    ],
  },
  {
    id: "silencio",
    name: "Silêncio",
    href: "/biblia",
    headline: "ensina a ouvir o versículo",
    cards: [
      {
        label: "Corte",
        title: "Uma notificação a menos",
        description: "O silêncio da leitura começa no aparelho. Sem isso, o texto compete com um feed que não termina.",
        meta: "Nota 01 · Ambiente",
      },
      {
        label: "Descobrir",
        title: "A pausa depois da frase",
        description: "Contar até quatro após um versículo impede que o próximo comece antes do anterior assentar.",
        meta: "Nota 02 · Intervalo",
      },
      {
        label: "Prática",
        title: "Ler menos do que cabe",
        description: "Parar no meio do capítulo, de propósito, é uma forma de respeito: o texto não é lista para zerar.",
        meta: "Nota 03 · Contenção",
      },
      {
        label: "Retorno",
        title: "Sair sem concluir",
        description: "Encerrar em silêncio, sem resumo imediato, deixa a frase trabalhar enquanto você volta ao dia.",
        meta: "Nota 04 · Fechamento",
      },
    ],
  },
  {
    id: "comunidade",
    name: "Comunidade",
    href: "/devocional",
    headline: "guarda o que foi lido juntos",
    cards: [
      {
        label: "Partilha",
        title: "Um versículo, não um sermão",
        description: "Dizer o que o texto fez em você é diferente de explicar o capítulo inteiro para impressionar.",
        meta: "Nota 01 · Conversa",
      },
      {
        label: "Descobrir",
        title: "Ouvir a leitura alheia",
        description: "Outra pessoa destaca o que você pulou. A comunidade corrige o ponto cego do hábito solitário.",
        meta: "Nota 02 · Escuta",
      },
      {
        label: "Prática",
        title: "Combinar o mesmo trecho",
        description: "Dois leitores no mesmo capítulo, no mesmo dia, criam um chão comum sem exigir reunião longa.",
        meta: "Nota 03 · Acordo simples",
      },
      {
        label: "Retorno",
        title: "Pedir conta com gentileza",
        description: "Perguntar “você leu?” sem acusação sustenta o plano melhor do que um grupo que some na terceira semana.",
        meta: "Nota 04 · Cuidado",
      },
    ],
  },
  {
    id: "esperanca",
    name: "Esperança",
    href: "/biblia",
    headline: "orienta o olhar adiante",
    cards: [
      {
        label: "Horizonte",
        title: "Promessa, não otimismo",
        description: "A esperança bíblica não nega o dia difícil. Ela recusa tratar o dia difícil como a última palavra.",
        meta: "Nota 01 · Direção",
      },
      {
        label: "Descobrir",
        title: "O futuro no presente",
        description: "Textos de consolo funcionam quando você os lê no meio da semana, não só quando já está resolvido.",
        meta: "Nota 02 · Uso real",
      },
      {
        label: "Prática",
        title: "Uma linha para guardar",
        description: "Sair da leitura com uma frase que enfrenta o medo concreto do dia. O resto pode esperar.",
        meta: "Nota 03 · Aplicação",
      },
      {
        label: "Retorno",
        title: "Reabrir o mesmo consolo",
        description: "Versículos de esperança pedem recorrência. Eles não se esgotam na primeira vez que acertam.",
        meta: "Nota 04 · Permanência",
      },
    ],
  },
]
