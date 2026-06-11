import { BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const TIMELINE = [
  { year: 33,   century: 1,  category: "apostolic",  title: "Pentecostes — Nascimento da Igreja", desc: "Derramamento do Espírito Santo em Jerusalém. Pedro prega e 3.000 são convertidos. A Igreja nasce como cumprimento da promessa de Cristo.", figures: ["Pedro", "João", "Paulo"], bibleRef: "Atos 2", importance: 5 },
  { year: 64,   century: 1,  category: "persecution",title: "Perseguição de Nero", desc: "Incêndio de Roma culpa os cristãos. Pedro crucificado de cabeça para baixo; Paulo decapitado. Início das grandes perseguições imperiais.", figures: ["Nero", "Pedro", "Paulo"], importance: 4 },
  { year: 95,   century: 1,  category: "canon",      title: "Apocalipse de João em Patmos", desc: "João recebe a Revelação durante exílio na ilha de Patmos. Última das epístolas apostólicas. Encerramento do cânone do Novo Testamento.", figures: ["João Apóstolo"], bibleRef: "Apocalipse 1:9", importance: 5 },
  { year: 107,  century: 2,  category: "persecution",title: "Ignácio de Antioquia — Mártir", desc: "Bispo de Antioquia devorado por leões em Roma. Suas sete cartas defendem a unidade da Igreja e a divindade de Cristo.", figures: ["Ignácio de Antioquia"], importance: 3 },
  { year: 150,  century: 2,  category: "theology",   title: "Justino Mártir — Apologistas", desc: "Primeira defesa intelectual do Cristianismo perante o Império Romano. Justino demonstra a racionalidade da fé e é posteriormente martirizado.", figures: ["Justino Mártir"], importance: 3 },
  { year: 202,  century: 3,  category: "theology",   title: "Ireneu de Lyon e Tertuliano", desc: "Ireneu combate o gnosticismo com a 'regra de fé'. Tertuliano cunha o termo 'Trindade' e desenvolve a cristologia ocidental.", figures: ["Ireneu de Lyon", "Tertuliano"], importance: 4 },
  { year: 250,  century: 3,  category: "persecution",title: "Perseguição de Décio", desc: "Primeiro édito imperial exigindo que todos os cidadãos fizessem sacrifícios aos deuses romanos. Muitos mártires. Cipriano de Cartago lidera a Igreja.", figures: ["Décio", "Cipriano de Cartago", "Orígenes"], importance: 3 },
  { year: 303,  century: 4,  category: "persecution",title: "Grande Perseguição de Diocleciano", desc: "A perseguição mais brutal da história. Igrejas destruídas, Escrituras confiscadas e queimadas, bispos executados. Durou uma década.", figures: ["Diocleciano"], importance: 4 },
  { year: 313,  century: 4,  category: "event",      title: "Édito de Milão — Constantino", desc: "Constantino e Licínio concedem liberdade religiosa ao Império. Fim das perseguições. Início da era constantiniana da Igreja.", figures: ["Constantino I"], importance: 4 },
  { year: 325,  century: 4,  category: "council",    title: "Concílio de Niceia", desc: "Condena o arianismo de Ário. Afirma a divindade plena de Cristo — homoousios (da mesma substância) com o Pai. Credo Niceno formulado.", figures: ["Atanásio", "Constantino I", "Ário"], bibleRef: "João 1:1", importance: 5 },
  { year: 381,  century: 4,  category: "council",    title: "Concílio de Constantinopla", desc: "Afirma a divindade plena do Espírito Santo. Expande o Credo Niceno para a forma final. Trindade ortodoxa estabelecida definitivamente.", figures: ["Gregório de Nazianzo", "Gregório de Nissa"], importance: 5 },
  { year: 397,  century: 4,  category: "canon",      title: "Cânone do NT — Concílio de Cartago", desc: "Ratificação oficial dos 27 livros do Novo Testamento. Agostinho e Jerônimo contribuem decisivamente. A Vulgata latina é completada.", figures: ["Agostinho de Hipona", "Jerônimo"], importance: 5 },
  { year: 430,  century: 5,  category: "theology",   title: "Agostinho de Hipona", desc: "Teologia da graça soberana contra o pelagianismo. A Cidade de Deus, Confissões, De Trinitate. Maior influência no pensamento reformado. Precursor direto da Reforma.", figures: ["Agostinho de Hipona", "Pelágio"], importance: 5 },
  { year: 451,  century: 5,  category: "council",    title: "Concílio de Calcedônia", desc: "Define as duas naturezas de Cristo: verdadeiro Deus e verdadeiro homem, em uma só pessoa, sem mistura, confusão, divisão ou separação.", figures: ["Papa Leão I"], importance: 5 },
  { year: 1054, century: 11, category: "schism",     title: "Grande Cisma do Oriente", desc: "Divisão formal entre Igreja Católica Romana e Igreja Ortodoxa Oriental. Causas: autoridade papal, filioque e diferenças culturais acumuladas.", figures: ["Papa Leão IX", "Cerulário"], importance: 4 },
  { year: 1095, century: 11, category: "event",      title: "Primeira Cruzada", desc: "Papa Urbano II convoca a reconquista de Jerusalém. Mistura de fervor religioso, ambição política e violência. Conquista de Jerusalém em 1099.", figures: ["Papa Urbano II", "Godofredo de Bulhão"], importance: 3 },
  { id: "waldo", year: 1173, century: 12, category: "reformation", title: "Pedro Valdo — Valdenses", desc: "Mercador de Lyon distribui seus bens e traduz a Bíblia para o vernáculo. Os Valdenses pregam pobreza evangélica e as Escrituras. Perseguidos como hereges, mas sobrevivem até a Reforma.", figures: ["Pedro Valdo"], importance: 3 },
  { year: 1382, century: 14, category: "reformation",title: "John Wycliffe — Estrela da Manhã", desc: "Traduz a Bíblia para o inglês pela primeira vez. Critica a transubstanciação, o celibato clerical e a autoridade papal. 'A Escritura é a única autoridade.'", figures: ["John Wycliffe"], importance: 4 },
  { year: 1415, century: 15, category: "persecution",title: "Martírio de Jan Hus", desc: "Bispo boêmio queimado vivo no Concílio de Constança. Pregou Sola Scriptura, criticou indulgências e a corrupção papal — cem anos antes de Lutero. 'Podem matar o ganso, mas o cisne virá.'", figures: ["Jan Hus"], importance: 4 },
  { year: 1456, century: 15, category: "canon",      title: "Bíblia de Gutenberg", desc: "Johannes Gutenberg imprime a primeira Bíblia com tipos móveis em Mainz. A tipografia revoluciona a propagação da Palavra e torna a Reforma possível.", figures: ["Johannes Gutenberg"], importance: 4 },
  { year: 1517, century: 16, category: "reformation",title: "Lutero — As 95 Teses", desc: "Martinho Lutero afixa as 95 Teses em Wittenberg, 31 de outubro. Contesta o comércio de indulgências. Início oficial da Reforma Protestante. A tipografia espalha o texto pela Europa em semanas.", figures: ["Martinho Lutero"], importance: 5 },
  { year: 1519, century: 16, category: "reformation",title: "Zwínglio e a Reforma Suíça", desc: "Ulrico Zwínglio inicia a Reforma em Zurique pregando através dos Evangelhos versículo por versículo. Reforma a liturgia e rejeita imagens. Debate de Baden e Marburgo com Lutero.", figures: ["Ulrico Zwínglio"], importance: 4 },
  { year: 1521, century: 16, category: "reformation",title: "Dieta de Worms — Aqui Me Firmo", desc: "Lutero comparece perante o Imperador Carlos V. Recusa-se a retratar-se: 'Aqui me firmo; não posso fazer de outro modo. Que Deus me ajude.' Excomungado; protegido por Frederico o Sábio.", figures: ["Martinho Lutero", "Carlos V"], importance: 5 },
  { year: 1522, century: 16, category: "canon",      title: "Bíblia Alemã de Lutero", desc: "Lutero traduz o Novo Testamento para o alemão em onze semanas no castelo de Wartburg. Usa linguagem do povo. A tradução completa (1534) unifica o alemão moderno.", figures: ["Martinho Lutero", "Melanchthon"], importance: 5 },
  { year: 1525, century: 16, category: "reformation",title: "Melanchthon e os Loci Communes", desc: "Filipe Melanchthon publica o primeiro manual sistemático de teologia luterana. Redige a Confissão de Augsburgo (1530) — base do luteranismo. Colaborador fiel de Lutero por décadas.", figures: ["Filipe Melanchthon"], importance: 3 },
  { year: 1536, century: 16, category: "reformation",title: "Calvino — Institutas da Religião Cristã", desc: "João Calvino publica as Institutas em Basileia, aos 26 anos. Sistema teológico completo: soberania de Deus, eleição, TULIP, ecclesiologia reformada. Revisadas e expandidas até 1559.", figures: ["João Calvino"], importance: 5 },
  { year: 1536, century: 16, category: "persecution",title: "Martírio de William Tyndale", desc: "Tyndale estrangulado e queimado perto de Bruxelas. Traduziu o NT e parte do AT para o inglês diretamente do grego e hebraico. Suas palavras formam 80% da versão KJV.", figures: ["William Tyndale"], importance: 4 },
  { year: 1555, century: 16, category: "persecution",title: "Mártires de Oxford", desc: "Hugh Latimer e Nicholas Ridley queimados em Oxford pela rainha Maria Tudor (Bloody Mary). Latimer ao morrer: 'Tenhamos bom ânimo, Ridley; acenderemos hoje uma vela que não se apagará.' Cranmer queimado em 1556.", figures: ["Hugh Latimer", "Nicholas Ridley", "Thomas Cranmer"], importance: 4 },
  { year: 1560, century: 16, category: "reformation",title: "João Knox e a Reforma Escocesa", desc: "João Knox lidera a Reforma na Escócia. Fundação do Presbiterianismo. Confissão Escocesa adotada pelo Parlamento. 'Dá-me a Escócia, ou morrerei.'", figures: ["João Knox"], importance: 4 },
  { year: 1563, century: 16, category: "council",    title: "Catecismo de Heidelberg", desc: "Catecismo reformado elaborado em Heidelberg sob Frederico III do Palatinado. Combina profundidade teológica com calor pastoral. Amplamente usado ainda hoje.", figures: ["Zacharias Ursinus", "Caspar Olevianus"], importance: 4 },
  { year: 1611, century: 17, category: "canon",      title: "Bíblia do Rei Jaime (KJV)", desc: "Tradução para o inglês encomendada pelo Rei Jaime I, por 47 eruditos. Base da tradição literária inglesa. Amplamente influente por quatro séculos.", importance: 4 },
  { year: 1618, century: 17, category: "council",    title: "Sínodo de Dort — TULIP", desc: "Sínodo convocado para responder ao Arminianismo dos Remonstrates. Afirma os Cinco Pontos do Calvinismo: Depravação Total, Eleição Incondicional, Expiação Particular, Graça Irresistível, Perseverança dos Santos.", figures: ["Franciscus Gomarus", "Johan van Oldenbarnevelt"], importance: 5 },
  { year: 1643, century: 17, category: "council",    title: "Assembleia de Westminster", desc: "121 ministros e 30 parlamentares reunidos em Westminster durante 5 anos e meio. Produzem a Confissão de Westminster, o Catecismo Maior e o Breve. Documentos definidores do Presbiterianismo.", figures: ["Samuel Rutherford", "George Gillespie", "Thomas Goodwin"], importance: 5 },
  { year: 1689, century: 17, category: "council",    title: "Confissão Batista de Fé", desc: "Segunda Confissão de Londres — batistas reformados adotam uma confissão próxima à de Westminster, afirmando o batismo de crentes e a soberania de Deus.", importance: 3 },
  { year: 1730, century: 18, category: "revival",    title: "Grande Despertar — Jonathan Edwards", desc: "Avivamento nas colônias americanas. Edwards prega 'Pecadores nas Mãos de um Deus Irado' em Enfield (1741). Whitefield atravessa o Atlântico 13 vezes pregando para multidões ao ar livre.", figures: ["Jonathan Edwards", "George Whitefield"], importance: 4 },
  { year: 1792, century: 18, category: "missions",   title: "William Carey — Pai das Missões Modernas", desc: "Sapateiro batista parte para a Índia. Traduz a Bíblia para dezenas de idiomas. 'Espera grandes coisas de Deus; empreende grandes coisas para Deus.'", figures: ["William Carey"], importance: 4 },
  { year: 1859, century: 19, category: "revival",    title: "Spurgeon e o Avivamento Vitoriano", desc: "Charles Spurgeon prega para 23.000 em Crystal Palace. O Avivamento de 1857–59 varre EUA e Grã-Bretanha. Dwight L. Moody evangeliza as cidades americanas.", figures: ["Charles Spurgeon", "Dwight L. Moody"], importance: 4 },
  { year: 1900, century: 20, category: "event",      title: "Século XX — Liberalismo e Fundamentalismo", desc: "Crítica histórica ameaça a inerrância bíblica. Machen funda a Igreja Presbiteriana Ortodoxa (1936). B.B. Warfield e Kuyper defendem a ortodoxia reformada.", figures: ["J. Gresham Machen", "Abraham Kuyper", "B.B. Warfield"], importance: 3 },
  { year: 2000, century: 21, category: "event",      title: "Século XXI — Renascimento Reformado", desc: "Nova geração redescobre a teologia reformada. Piper, MacArthur, Sproul e Keller alcançam milhões. A Igreja cresce vigorosamente na África, Ásia e América Latina.", figures: ["John Piper", "R.C. Sproul", "Tim Keller", "John MacArthur"], importance: 3 },
]

const CATEGORY_LABELS: Record<string, string> = {
  apostolic: "Igreja Primitiva", persecution: "Perseguição", canon: "Cânone",
  theology: "Teologia", council: "Concílio", schism: "Cisma",
  reformation: "Reforma", revival: "Avivamento", missions: "Missões", event: "Evento",
}

const CATEGORY_GOLD: Record<string, boolean> = {
  reformation: true,
  council: true,
  canon: true,
}

export default function HistoriaPage() {
  const centuries = [...new Set(TIMELINE.map(e => e.century))].sort((a, b) => a - b)
  let globalIdx = 0

  return (
    <div className="max-w-2xl mx-auto px-2 py-8 space-y-6">

      <div>
        <p className="candle-enter candle-delay-0 font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em] mb-1">Fides et Historia</p>
        <h1 className="candle-enter candle-delay-1 font-serif text-3xl text-[#e2d9c5] font-normal">História da Igreja</h1>
        <p className="candle-enter candle-delay-2 text-[#55524a] text-xs mt-1">33 d.C. → Hoje · {TIMELINE.length} eventos</p>
      </div>

      <div className="candle-enter candle-delay-2 h-px bg-[#2e2b42]" />

      {/* Legenda */}
      <div className="candle-enter candle-delay-3 flex flex-wrap gap-x-4 gap-y-1">
        {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
          <span key={id} className={cn("text-[10px]",
            CATEGORY_GOLD[id] ? "text-[#c9a654] opacity-70" : "text-[#3d3a55]"
          )}>
            {label}
          </span>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[72px] top-0 bottom-0 w-px bg-[#2e2b42]" />

        {centuries.map(century => {
          const events = TIMELINE.filter(e => e.century === century)
          const centuryDelay = 300 + globalIdx * 35
          return (
            <div key={century} className="mb-10">
              <div className="candle-enter flex items-center gap-4 mb-4"
                style={{ animationDelay: `${centuryDelay}ms` }}>
                <span className="w-16 text-right font-display text-[9px] text-[#3d3a55] uppercase tracking-widest">
                  Séc. {century < 10 ? `0${century}` : century}
                </span>
                <div className="w-2 h-2 rounded-full bg-[#2e2b42] border border-[#3d3a55] relative z-10" />
              </div>

              <div className="space-y-6">
                {events.map((event, i) => {
                  const eventDelay = 320 + globalIdx * 35
                  globalIdx++
                  const isKey = event.importance >= 5
                  const isGold = CATEGORY_GOLD[event.category]
                  return (
                    <div key={i} className="candle-flame flex gap-4"
                      style={{ animationDelay: `${eventDelay}ms` }}>
                      <div className="w-16 text-right pt-1 flex-shrink-0">
                        <span className="text-[#3d3a55] text-xs font-mono">{event.year}</span>
                      </div>
                      <div className="relative z-10 flex-shrink-0 mt-1.5">
                        <div className={cn("w-2.5 h-2.5 rounded-full border",
                          isKey && isGold ? "border-[#c9a654] bg-[#c9a65420]" :
                          isKey          ? "border-[#8a8375] bg-[#55524a30]" :
                                           "border-[#2e2b42] bg-[#12111e]"
                        )} />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="card-soft px-4 py-3">
                          <div className="flex items-baseline gap-2 mb-1">
                            <h3 className={cn("font-serif text-sm leading-snug",
                              isKey ? "text-[#c9c0a8]" : "text-[#8a8375]"
                            )}>
                              {event.title}
                            </h3>
                            <span className={cn("text-[9px] flex-shrink-0",
                              isGold ? "text-[#c9a654] opacity-60" : "text-[#3d3a55]"
                            )}>
                              {CATEGORY_LABELS[event.category]}
                            </span>
                          </div>
                          <p className="text-[#55524a] text-xs leading-relaxed">{event.desc}</p>
                          {event.figures && event.figures.length > 0 && (
                            <div className="flex flex-wrap gap-x-2 mt-1.5">
                              {event.figures.map(f => (
                                <span key={f} className="text-[10px] text-[#3d3a55] font-serif italic">{f}</span>
                              ))}
                            </div>
                          )}
                          {event.bibleRef && (
                            <p className="mt-1.5 text-[#55524a] text-[10px] flex items-center gap-1 font-serif italic">
                              <BookOpen className="w-2.5 h-2.5" /> {event.bibleRef}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
