"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { RefreshCw, ThumbsUp, RotateCcw, BookOpen, Shuffle, Loader2 } from "lucide-react"
import Link from "next/link"
import { BOOK_ID_NAMES } from "@/lib/reading-plan"

export interface FlashCard {
  id:    string
  ref:   string
  text:  string
  color: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const COLOR_BORDER: Record<string, string> = {
  yellow: "rgba(201,166,84,0.35)",
  green:  "rgba(90,158,114,0.35)",
  blue:   "rgba(107,156,202,0.35)",
  red:    "rgba(201,107,90,0.35)",
}

export function MemorizarClient({ initialCards }: { initialCards: FlashCard[] }) {
  const [queue,         setQueue]         = useState<FlashCard[]>(() => shuffle(initialCards))
  const [index,         setIndex]         = useState(0)
  const [flipped,       setFlipped]       = useState(false)
  const [knownCount,    setKnownCount]    = useState(0)
  const [loadingRandom, setLoadingRandom] = useState(false)
  const [randomMode,    setRandomMode]    = useState(false)

  const current = queue[index]

  function nextCard() {
    setIndex(i => (i + 1) % queue.length)
    setFlipped(false)
  }

  function markKnown() {
    const next = queue.filter((_, i) => i !== index)
    setKnownCount(k => k + 1)
    setQueue(next)
    setIndex(i => (next.length === 0 ? 0 : i >= next.length ? 0 : i))
    setFlipped(false)
  }

  function resetDeck() {
    setQueue(shuffle(initialCards))
    setIndex(0)
    setFlipped(false)
    setKnownCount(0)
    setRandomMode(false)
  }

  async function loadRandom() {
    setLoadingRandom(true)
    try {
      const res  = await fetch("/api/memorizar/random?limit=10")
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) return
      const cards: FlashCard[] = data.map((v: { book: string; chapter: number; verse: number; text: string }) => ({
        id:    `rnd-${v.book}-${v.chapter}-${v.verse}`,
        ref:   `${BOOK_ID_NAMES[v.book] ?? v.book} ${v.chapter}:${v.verse}`,
        text:  v.text,
        color: "yellow",
      }))
      setQueue(shuffle(cards))
      setIndex(0)
      setFlipped(false)
      setKnownCount(0)
      setRandomMode(true)
    } finally {
      setLoadingRandom(false)
    }
  }

  if (initialCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-5 px-6">
        <BookOpen className="w-8 h-8 text-[#3d3a55]" />
        <p className="font-serif text-[#55524a] text-sm text-center max-w-xs leading-relaxed">
          Nenhum versículo grifado encontrado. Leia capítulos na Bíblia e grife versículos para criar flashcards.
        </p>
        <Link href="/biblia" className="text-[#c9a654] text-xs font-sans hover:opacity-80 transition-opacity">
          Ir para a Bíblia →
        </Link>
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 px-6 text-center">
        <p className="font-serif text-[#c9a654] text-xl">Parabéns!</p>
        <p className="text-[#8a8375] text-sm font-serif">
          {knownCount} versículo{knownCount !== 1 ? "s" : ""} revisado{knownCount !== 1 ? "s" : ""}
        </p>
        <div className="flex flex-col gap-2 mt-2 w-full max-w-xs">
          <button
            onClick={loadRandom}
            disabled={loadingRandom}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-serif text-[#c9a654] bg-[#c9a65415] border border-[#c9a65430] hover:bg-[#c9a65425] transition-all disabled:opacity-50"
          >
            {loadingRandom
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Shuffle className="w-3.5 h-3.5" />
            }
            Versículos aleatórios
          </button>
          {!randomMode && initialCards.length > 0 && (
            <button
              onClick={resetDeck}
              className="flex items-center justify-center gap-2 text-[#55524a] hover:text-[#c9c0a8] text-sm font-sans transition-colors py-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reiniciar meus grifos
            </button>
          )}
          {randomMode && (
            <button
              onClick={loadRandom}
              disabled={loadingRandom}
              className="flex items-center justify-center gap-2 text-[#55524a] hover:text-[#c9c0a8] text-sm font-sans transition-colors py-1.5"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Mais aleatórios
            </button>
          )}
        </div>
      </div>
    )
  }

  const borderColor = COLOR_BORDER[current.color] ?? COLOR_BORDER.yellow

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-10">

      {/* Progress */}
      <div className="flex items-center gap-3 mb-8 text-[#3d3a55] text-[11px] font-sans">
        <span className="text-[#55524a]">{index + 1} / {queue.length}</span>
        {randomMode && <span className="text-[#c9a654] opacity-60">· aleatórios</span>}
        {knownCount > 0 && (
          <span className="text-[#5a9e72]">· {knownCount} memorizados</span>
        )}
        <button
          onClick={resetDeck}
          title="Reiniciar com meus grifos"
          className="ml-1 hover:text-[#8a8375] transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Flashcard */}
      <div
        className="relative w-full max-w-md cursor-pointer select-none"
        style={{ perspective: "1200px", height: "300px" }}
        onClick={() => setFlipped(f => !f)}
      >
        <div
          className={cn(
            "absolute inset-0 transition-transform duration-500",
            "[transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]"
          )}
        >
          {/* Front — reference */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-8 [backface-visibility:hidden]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${borderColor}`,
              backdropFilter: "blur(24px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <p className="font-serif text-[#c9a654] text-2xl text-center mb-4 leading-snug">{current.ref}</p>
            <p className="text-[#3d3a55] text-[10px] font-sans uppercase tracking-widest">Toque para revelar</p>
          </div>

          {/* Back — text */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-8 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${borderColor}`,
              backdropFilter: "blur(24px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <p className="font-serif text-[#c9c0a8] text-sm text-center leading-[1.9] italic overflow-y-auto max-h-48">
              &ldquo;{current.text}&rdquo;
            </p>
            <p className="text-[#c9a654] text-[10px] font-serif mt-4 opacity-60">— {current.ref}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={cn(
        "flex items-center gap-4 mt-8 transition-all duration-300",
        !flipped && "opacity-0 pointer-events-none translate-y-1"
      )}>
        <button
          onClick={e => { e.stopPropagation(); nextCard() }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-serif text-[#55524a] hover:text-[#c9c0a8] transition-all hover:bg-white/5 border border-transparent hover:border-white/8"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Rever depois
        </button>
        <button
          onClick={e => { e.stopPropagation(); markKnown() }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-serif text-[#5a9e72] hover:text-[#6aae82] transition-all bg-[#5a9e7215] hover:bg-[#5a9e7225] border border-[#5a9e7230]"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          Sei!
        </button>
      </div>

      {/* Dot navigation (only when ≤ 20 cards) */}
      {queue.length <= 20 && (
        <div className="flex gap-1.5 mt-8">
          {queue.map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all duration-300",
                i === index
                  ? "w-3 h-1.5 bg-[#c9a654]"
                  : "w-1.5 h-1.5 bg-[#2e2b42]"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
