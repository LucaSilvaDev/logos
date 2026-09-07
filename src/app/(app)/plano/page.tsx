import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { CheckCircle2 } from "lucide-react"
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
      <div className="max-w-xl mx-auto px-2 py-8 space-y-8">

        <div>
          <h1 className="page-title">Plano de Leitura</h1>
          <p className="page-desc">Escolha um plano para começar</p>
        </div>

        <div className="hairline" />

        <div className="stagger-in space-y-2">
          {PLANS.map((plan) => (
            <PlanSetup key={plan.id} plan={plan} />
          ))}
        </div>

        <div className="quote-card quote-card-accent animate-fade-up delay-220">
          <p className="font-serif text-[18px] leading-relaxed italic">
            &ldquo;Bem-aventurado o homem que não anda no conselho dos ímpios...
            antes tem prazer na lei do Senhor, e medita na sua lei de dia e de noite.&rdquo;
          </p>
          <p className="mt-3 text-[14px]">Salmos 1:1–2</p>
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
    <div className="max-w-xl mx-auto px-2 py-8 space-y-8">

      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">Plano de Leitura</h1>
          <p className="page-desc">
            {planLabel} · Dia {dayOfPlan} de {planDays}
          </p>
        </div>
        <div className="text-right">
          <p className="home-stat">{completedPct}<span className="text-[15px] text-[#777b86]">%</span></p>
          <p className="home-stat-label">concluído</p>
        </div>
      </div>

      <div className="hairline" />

      <div className="space-y-3">
        <div className="flex justify-between text-[14px] text-[#777b86]">
          <span>Progresso</span>
          <span className="tabular-nums">{progressCount} / {planDays} dias</span>
        </div>
        <div className="track">
          <span style={{ width: `${completedPct}%` }} />
        </div>
      </div>

      <div className="quote-card">
        <p className="quote-cite mb-3">
          Hoje · {format(today, "d 'de' MMMM", { locale: ptBR })}
        </p>
        <p className="font-serif text-[22px] leading-snug mb-5">{todayPassage}</p>
        <form action="/api/plano/concluir" method="POST">
          <button type="submit" className="pill-action pill-action-fill">
            <CheckCircle2 className="w-4 h-4" /> Marcar como lido
          </button>
        </form>
      </div>

      {recentProgress.length > 0 && (
        <div className="space-y-3">
          <h2 className="section-title">Recentes</h2>
          <div className="space-y-2">
            {recentProgress.map((p: { id: string; completedAt: Date; readingDay: { passages: string; day: number } }) => (
              <div
                key={p.id}
                className="mist-row"
              >
                <div className="flex items-center gap-3 w-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#777b86] flex-shrink-0" />
                  <span className="font-serif text-[15px] flex-1">{p.readingDay.passages}</span>
                  <span className="quote-cite">{format(new Date(p.completedAt), "d MMM", { locale: ptBR })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancelar plano */}
      <div className="candle-enter pt-4 border-t border-[#1a1928]" style={{ animationDelay: "1100ms" }}>
        <CancelPlan />
      </div>
    </div>
  )
}
