export const dailyQuotes = [
  {
    content: "Nossa fé não está ancorada em probabilidades, mas na Palavra de Deus.",
    author: "João Calvino",
    source: "Institutas da Religião Cristã",
    era: "Reformadores",
  },
  {
    content: "Você não pode orar a Deus a não ser que saiba quem é Deus.",
    author: "Paul Washer",
    source: "HeartCry Missionary Society",
    era: "Contemporâneos",
  },
  {
    content: "Um homem grande na oração estará por muito tempo na presença de Deus antes de fazer qualquer coisa. Então ele vai para o trabalho com poder.",
    author: "John Piper",
    source: "Desiring God",
    era: "Contemporâneos",
  },
  {
    content: "Toda a Escritura é igualmente inspirada, mas nem toda a Escritura é igualmente aplicável a toda situação.",
    author: "D.A. Carson",
    source: "Exegetical Fallacies",
    era: "Contemporâneos",
  },
  {
    content: "O homem que conhece a Deus com a cabeça deve conhecê-Lo também com o coração.",
    author: "J.I. Packer",
    source: "O Conhecimento de Deus",
    era: "Sec XIX-XX",
  },
  {
    content: "A graça de Deus é a fonte de toda a nossa salvação. A fé é simplesmente a mão vazia que recebe essa graça.",
    author: "Herman Bavinck",
    source: "Dogmática Reformada",
    era: "Sec XIX-XX",
  },
  {
    content: "O arrependimento e a fé não são as causas da nossa salvação, mas os frutos dela.",
    author: "Jonathan Edwards",
    source: "Religious Affections",
    era: "Puritanos",
  },
  {
    content: "A Escritura é o espelho no qual a fé contempla Deus.",
    author: "João Calvino",
    source: "Institutas I.7.1",
    era: "Reformadores",
  },
  {
    content: "Não existe segurança fora da vontade soberana de Deus.",
    author: "John Knox",
    source: "Historia of the Reformation",
    era: "Reformadores",
  },
  {
    content: "A teologia não é um conjunto de ideias abstratas. É o conhecimento do Deus vivo.",
    author: "Louis Berkhof",
    source: "Teologia Sistemática",
    era: "Sec XIX-XX",
  },
  {
    content: "A oração não é uma roda sobressalente que você puxa quando está em apuros, mas é o volante que mantém o piloto no caminho certo.",
    author: "Timothy Keller",
    source: "Prayer: Experiencing Awe and Intimacy with God",
    era: "Contemporâneos",
  },
  {
    content: "A profecia não foi dada para satisfazer nossa curiosidade sobre o futuro, mas para transformar nosso caráter no presente.",
    author: "D.A. Carson",
    source: "The Gospel According to John",
    era: "Contemporâneos",
  },
  {
    content: "Conhecer a Deus é o maior bem que o homem pode alcançar.",
    author: "Francisco Turrettini",
    source: "Institutio Theologiae Elencticae",
    era: "Puritanos",
  },
  {
    content: "A graça de Cristo não é uma exceção à lei moral de Deus, mas seu cumprimento perfeito.",
    author: "Abraham Kuyper",
    source: "Lectures on Calvinism",
    era: "Sec XIX-XX",
  },
  {
    content: "A missão da Igreja é proclamar o Evangelho, não reformar a sociedade. Mas o Evangelho proclamado transforma a sociedade.",
    author: "Augustus Nicodemus",
    source: "Conferências Reformadas no Brasil",
    era: "Brasil",
  },
]

export function getQuoteOfTheDay(): typeof dailyQuotes[0] {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return dailyQuotes[dayOfYear % dailyQuotes.length]
}
