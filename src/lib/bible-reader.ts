import { BOOKS } from "@/lib/reading-plan"

export const VERSIONS = [
  { id: "nvi", label: "NVI", desc: "Nova Versão Internacional" },
  { id: "naa", label: "NAA", desc: "Nova Almeida Atualizada" },
  { id: "nvt", label: "NVT", desc: "Nova Versão Transformadora" },
] as const

export const HL_COLORS = [
  { id: "yellow", style: "#c9a654" },
  { id: "green",  style: "#5a9e72" },
  { id: "blue",   style: "#a09898" },
  { id: "red",    style: "#c96b5a" },
] as const

export const BOOK_MAP = Object.fromEntries(BOOKS.map(b => [b.id, b]))

export interface Verse { number: number; text: string; endNumber?: number; heading?: string }
export interface HlEntry { id: string; color: string }
export type BibleVersion = "nvi" | "naa" | "nvt"
export type FontSize = "sm" | "md" | "lg"
export type ApiError = "ERROR" | "AUTH_REQUIRED" | "RATE_LIMIT" | null

export function readSavedPos() {
  try {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem("selah-bible-pos")
    if (!raw) return null
    const p = JSON.parse(raw)
    const book = BOOKS.find(b => b.id === p.bookId) ?? null
    if (!book) return null
    const chapter = typeof p.chapter === "number" && p.chapter >= 1 ? p.chapter : 1
    const version: BibleVersion = ["nvi", "naa", "nvt"].includes(p.version) ? p.version : "nvi"
    return { book, chapter, version }
  } catch { return null }
}

export function readSavedFont(): FontSize {
  try {
    if (typeof window === "undefined") return "md"
    const s = localStorage.getItem("selah-bible-font")
    return s === "sm" || s === "lg" ? s : "md"
  } catch { return "md" }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ")
  let line = ""
  let curY = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY); line = word; curY += lineHeight
    } else { line = test }
  }
  ctx.fillText(line, x, curY)
  return curY
}

export function generateVerseImage(verseText: string, verseRef: string): string {
  const S = 1080
  const canvas = document.createElement("canvas")
  canvas.width = S; canvas.height = S
  const ctx = canvas.getContext("2d")!
  const bg = ctx.createLinearGradient(0, 0, S, S)
  bg.addColorStop(0, "#16152a"); bg.addColorStop(1, "#0d0c1c")
  ctx.fillStyle = bg; ctx.fillRect(0, 0, S, S)
  const glow = ctx.createRadialGradient(S/2, S/2, 0, S/2, S/2, S*0.6)
  glow.addColorStop(0, "rgba(201,166,84,0.07)"); glow.addColorStop(1, "transparent")
  ctx.fillStyle = glow; ctx.fillRect(0, 0, S, S)
  const lineGrad = ctx.createLinearGradient(80, 0, S-80, 0)
  lineGrad.addColorStop(0, "transparent")
  lineGrad.addColorStop(0.3, "rgba(201,166,84,0.5)")
  lineGrad.addColorStop(0.7, "rgba(201,166,84,0.5)")
  lineGrad.addColorStop(1, "transparent")
  ctx.fillStyle = lineGrad
  ctx.fillRect(80, 240, S-160, 1); ctx.fillRect(80, S-240, S-160, 1)
  ctx.fillStyle = "rgba(201,166,84,0.35)"
  ctx.font = "500 22px 'Georgia', serif"
  ctx.textAlign = "center"
  ctx.fillText("SELAH", S/2, 185)
  ctx.fillStyle = "#c9c0a8"
  ctx.font = `italic 44px 'Georgia', serif`
  ctx.textAlign = "center"
  const endY = wrapText(ctx, `"${verseText}"`, S/2, 340, S-200, 68)
  ctx.fillStyle = "#c9a654"
  ctx.font = "500 30px 'Georgia', serif"
  ctx.fillText(verseRef, S/2, Math.max(endY + 80, 740))
  return canvas.toDataURL("image/png")
}
