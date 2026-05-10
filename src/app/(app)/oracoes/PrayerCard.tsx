"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronDown, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Prayer {
  id: string
  title: string
  content: string
  category: string
  createdAt: Date
}

const CATEGORY_LABELS: Record<string, string> = {
  personal: "Pessoal",
  family:   "Família",
  church:   "Igreja",
  missions: "Missões",
}

export function PrayerCard({ prayer }: { prayer: Prayer }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [marking, setMarking] = useState(false)

  async function markAnswered() {
    setMarking(true)
    await fetch(`/api/oracoes/${prayer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answered: true }),
    })
    router.refresh()
  }

  return (
    <div className="card-soft px-4 py-4 space-y-0">
      {/* Header — clicável para expandir */}
      <button onClick={() => { setExpanded(e => !e); setConfirming(false) }}
        className="w-full text-left flex items-start gap-3 group">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <h3 className="font-serif text-[#c9c0a8] text-sm group-hover:text-[#e2d9c5] transition-colors">
              {prayer.title}
            </h3>
            <span className="text-[10px] text-[#3d3a55] flex-shrink-0">
              {CATEGORY_LABELS[prayer.category] ?? prayer.category}
            </span>
          </div>
          {!expanded && prayer.content && (
            <p className="text-[#55524a] text-xs leading-relaxed line-clamp-1">{prayer.content}</p>
          )}
          <p className="text-[#3d3a55] text-[10px] mt-1">
            {format(new Date(prayer.createdAt), "d MMM yyyy", { locale: ptBR })}
          </p>
        </div>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-[#3d3a55] flex-shrink-0 mt-0.5 transition-transform duration-200",
          expanded && "rotate-180"
        )} />
      </button>

      {/* Expandido */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#1a1928] space-y-3">
          {prayer.content && (
            <p className="font-serif text-[#8a8375] text-sm leading-relaxed">{prayer.content}</p>
          )}

          {!confirming ? (
            <button onClick={() => setConfirming(true)}
              className="flex items-center gap-1.5 text-[10px] text-[#3d3a55] hover:text-[#5a9e72] transition-colors font-serif">
              <CheckCircle2 className="w-3 h-3" /> Marcar como respondida
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-serif text-[#8a8375] text-xs italic">Deus respondeu esta oração?</span>
              <button onClick={markAnswered} disabled={marking}
                className="text-xs text-[#5a9e72] hover:opacity-80 font-serif disabled:opacity-40">
                {marking ? "…" : "Sim, respondida"}
              </button>
              <button onClick={() => setConfirming(false)}
                className="text-xs text-[#3d3a55] hover:opacity-80 font-serif">
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
