import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import { parseBibliaOnlineHtml, parseYVHtml } from "./bible-parsers"

// Fixture: HTML real de https://www.bibliaonline.com.br/nvi/gn/1 (salvo em
// __fixtures__/bibliaonline-gn1.html). Serve como teste de regressão contra
// o parser produzido para o markup real do site — o parser já quebrou em
// produção várias vezes quando o site mudou a estrutura (ver git log), e um
// fixture congelado pega isso antes do deploy, quando o site mudar de novo.
const gn1Html = fs.readFileSync(
  path.join(__dirname, "__fixtures__/bibliaonline-gn1.html"),
  "utf-8",
)

describe("parseBibliaOnlineHtml — fixture real (Gênesis 1, NVI)", () => {
  const verses = parseBibliaOnlineHtml(gn1Html)

  it("extracts exactly the 31 verses of Genesis 1", () => {
    expect(verses).toHaveLength(31)
    expect(verses.map(v => v.number)).toEqual(Array.from({ length: 31 }, (_, i) => i + 1))
  })

  it("does not leak the bare verse-number label into the verse text", () => {
    for (const v of verses) expect(v.text).not.toMatch(/^\d+\s/)
  })

  it("bounds the last verse to the chapter content — regression for the last-verse-swallows-the-page bug", () => {
    // Antes da correção, o versículo 31 (o último marcador data-v da página)
    // não tinha um próximo marcador para delimitar seu fim, e o parser
    // engolia o resto do HTML (nav, scripts, anúncios) até o fim do documento.
    const last = verses[verses.length - 1]
    expect(last.text.length).toBeLessThan(500)
    expect(last.text).not.toContain("<script")
    expect(last.text).not.toContain("window.")
    expect(last.text).not.toContain("Termos de uso")
  })

  it("produces clean, readable text for a verse with no footnotes", () => {
    expect(verses[0].text).toContain("No princípio")
    expect(verses[0].text).toContain("Deus criou os céus e a terra")
  })
})

describe("parseBibliaOnlineHtml — synthetic edge cases", () => {
  it("returns [] when there are no data-v markers (site markup changed)", () => {
    expect(parseBibliaOnlineHtml("<p>sem marcadores aqui</p>")).toEqual([])
  })

  it("strips footnote buttons (data-note)", () => {
    const html = `<span data-v=".1.">Texto do versículo</span><button data-note="x">[a]</button><span data-v=".2.">Segundo.</span>`
    const verses = parseBibliaOnlineHtml(html)
    expect(verses[0]).toEqual({ number: 1, text: "Texto do versículo" })
  })

  it("strips HTML comments", () => {
    const html = `<span data-v=".1.">Texto<!-- comentário interno --> completo.</span>`
    const verses = parseBibliaOnlineHtml(html)
    expect(verses).toEqual([{ number: 1, text: "Texto completo." }])
  })

  it("decodes HTML entities", () => {
    const html = `<span data-v=".1.">Ele disse: &quot;Bom&quot; &amp; &#39;justo&#39;.</span>`
    const verses = parseBibliaOnlineHtml(html)
    expect(verses).toEqual([{ number: 1, text: `Ele disse: "Bom" & 'justo'.` }])
  })

  it("strips trailing copyright notices", () => {
    const html = `<span data-v=".1.">Texto do versículo. Copyright© 2017 Sociedade Bíblica</span>`
    const verses = parseBibliaOnlineHtml(html)
    expect(verses).toEqual([{ number: 1, text: "Texto do versículo." }])
  })

  it("groups multiple data-v markers for the same verse number (continuations)", () => {
    const html =
      `<span data-v=".5.">Primeira parte do versículo cinco,</span>` +
      `<span data-v=".5.">continuação do mesmo versículo.</span>`
    const verses = parseBibliaOnlineHtml(html)
    expect(verses).toEqual([
      { number: 5, text: "Primeira parte do versículo cinco, continuação do mesmo versículo." },
    ])
  })

  it("drops a bare verse-number label segment (e.g. a decorative span whose only content is the number)", () => {
    const html = `<span data-v=".1.">1</span><span data-v=".1.">Texto real do versículo.</span>`
    const verses = parseBibliaOnlineHtml(html)
    expect(verses).toEqual([{ number: 1, text: "Texto real do versículo." }])
  })

  it("sorts verses by number regardless of source order", () => {
    const html =
      `<span data-v=".3.">Terceiro.</span>` +
      `<span data-v=".1.">Primeiro.</span>` +
      `<span data-v=".2.">Segundo.</span>`
    expect(parseBibliaOnlineHtml(html).map(v => v.number)).toEqual([1, 2, 3])
  })
})

describe("parseYVHtml", () => {
  it("extracts verses from YouVersion marker format", () => {
    const html =
      `<span class="yv-v" v="1"></span><span class="yv-vlbl">1</span>No princípio, Deus criou os céus e a terra.` +
      `<span class="yv-v" v="2"></span><span class="yv-vlbl">2</span>A terra era sem forma e vazia.`
    const verses = parseYVHtml(html)
    expect(verses).toEqual([
      { number: 1, text: "No princípio, Deus criou os céus e a terra." },
      { number: 2, text: "A terra era sem forma e vazia." },
    ])
  })

  it("returns [] for empty content", () => {
    expect(parseYVHtml("")).toEqual([])
  })

  it("strips inline tags inside verse text", () => {
    const html = `<span class="yv-v" v="1"></span><span class="yv-vlbl">1</span>Texto com <i>ênfase</i> no meio.`
    const verses = parseYVHtml(html)
    expect(verses).toEqual([{ number: 1, text: "Texto com ênfase no meio." }])
  })
})
