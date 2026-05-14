import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { CheckCircle2, BookOpen, X } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getPassage, PLAN_CONFIG } from "@/lib/reading-plan"
import PlanSetup from "./PlanSetup"
import CancelPlan from "./CancelPlan"

const PLANS = Object.entries(PLAN_CONFIG).map(([id, cfg]) => ({
  id,
  label: cfg.label,
  days: cfg.days,
  desc: planDesc(id),
}))

function planDesc(id: string) {
  const map: Record<string, string> = {
    "1y":    "Bíblia completa · ~3–4 capítulos por dia",
    "6m":    "Bíblia completa intensiva · ~6 cap/dia",
    "nt-3m": "NT completo em 90 dias · ~3 cap/dia",
    "nt-1m": "NT intensivo em 30 dias · ~9 cap/dia",
    "ot-1y": "AT completo em 1 ano · ~2–3 cap/dia",
    "ot-6m": "AT intensivo em 6 meses · ~5 cap/dia",
    "salmos":"150 Salmos em 30 dias · 5 por dia",
    "evang": "Mateus, Marcos, Lucas e João · Quaresma",
  }
  return map[id] ?? ""
}

export default async function PlanoPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const profile = await db.userProfile.findUnique({ where: { userId } })
  const planType = profile?.readingPlanType

  if (!planType) {
    return (
      <div className="max-w-xl mx-auto px-2 py-8 space-y-8 animate-fade-in">
        <div>
          <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em] mb-1">Disciplina Espiritual</p>
          <h1 className="font-serif text-3xl text-[#e2d9c5] font-normal">Plano de Leitura</h1>
          <p className="text-[#55524a] text-xs mt-1">Escolha um plano para começar</p>
        </div>

        <div className="h-px bg-[#2e2b42]" />

        <div className="space-y-2">
          {PLANS.map(plan => (
            <PlanSetup key={plan.id} plan={plan} />
          ))}
        </div>

        <div className="relative pl-6 pr-4 py-4">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#c9a654] opacity-30" />
          <p className="font-serif text-[#8a8375] text-sm leading-relaxed italic">
            &ldquo;Bem-aventurado o homem que não anda no conselho dos ímpios...
            antes tem prazer na lei do Senhor, e medita na sua lei de dia e de noite.&rdquo;
          </p>
          <p className="text-[#c9a654] text-xs mt-2 font-serif">Salmos 1:1–2</p>
        </div>
      </div>
    )
  }

  const progressCount = await db.readingPlanProgress.count({ where: { userId } })
  const config = PLAN_CONFIG[planType]
  const planDays = config?.days ?? 365
  const planLabel = config?.label ?? planType
  const completedPct = Math.round((progressCount / planDays) * 100)

  const dayOfPlan = progressCount + 1
  const todayPassage = getPassage(planType, dayOfPlan)

  const recentProgress = await db.readingPlanProgress.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    take: 7,
    include: { readingDay: { select: { passages: true, day: true } } },
  })

  const today = new Date()

  return (
    <div className="max-w-xl mx-auto px-2 py-8 space-y-8 animate-fade-in">

      <div className="flex items-end justify-between">
        <div>
          <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em] mb-1">Disciplina Espiritual</p>
          <h1 className="font-serif text-3xl text-[#e2d9c5] font-normal">Plano de Leitura</h1>
          <p className="text-[#55524a] text-xs mt-1">
            {planLabel} · Dia {dayOfPlan} de {planDays}
          </p>
        </div>
        <div className="text-right">
          <p className="font-serif text-3xl text-[#e2d9c5]">{completedPct}<span className="text-base text-[#55524a]">%</span></p>
          <p className="text-[#3d3a55] text-[10px] uppercase tracking-wider font-display">concluído</p>
        </div>
      </div>

      <div className="h-px bg-[#2e2b42]" />

      {/* Progresso */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-[#3d3a55]">
          <span className="font-display uppercase tracking-wider">Progresso</span>
          <span>{progressCount} / {planDays} dias</span>
        </div>
        <div className="h-px w-full bg-[#2e2b42] relative">
          <div className="absolute left-0 top-0 h-full bg-[#c9a654] transition-all duration-700"
            style={{ width: `${completedPct}%` }} />
        </div>
      </div>

      {/* Leitura de hoje */}
      <div className="card-soft relative pl-8 pr-5 py-5">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#c9a654] to-transparent opacity-60" />
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-3.5 h-3.5 text-[#c9a654] opacity-60" />
          <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.2em]">
            Hoje · {format(today, "d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <p className="font-serif text-[#c9c0a8] text-xl mb-4">{todayPassage}</p>
        <form action="/api/plano/concluir" method="POST">
          <button type="submit"
            className="flex items-center gap-1.5 text-sm text-[#5a9e72] hover:opacity-80 transition-opacity font-serif">
            <CheckCircle2 className="w-4 h-4" /> Marcar como lido
          </button>
        </form>
      </div>

      {/* Leituras recentes */}
      {recentProgress.length > 0 && (
        <div className="space-y-3">
          <p className="font-display text-[9px] text-[#3d3a55] uppercase tracking-[0.25em]">Recentes</p>
          <div className="space-y-2">
            {recentProgress.map((p: { id: string; completedAt: Date; readingDay: { passages: string; day: number } }) => (
              <div key={p.id} className="card-soft flex items-center gap-3 px-4 py-2.5">
                <CheckCircle2 className="w-3 h-3 text-[#5a9e72] opacity-60 flex-shrink-0" />
                <span className="font-serif text-[#8a8375] text-sm flex-1">{p.readingDay.passages}</span>
                <span className="text-[#3d3a55] text-xs">{format(new Date(p.completedAt), "d MMM", { locale: ptBR })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancelar plano */}
      <div className="pt-4 border-t border-[#1a1928]">
        <CancelPlan />
      </div>
    </div>
  )
}
