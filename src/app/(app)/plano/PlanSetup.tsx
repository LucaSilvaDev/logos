"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Plan {
  id: string
  label: string
  days: number
  desc: string
  [key: string]: unknown
}

export default function PlanSetup({ plan, delay = 0 }: { plan: Plan; delay?: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function selectPlan() {
    setLoading(true)
    try {
      await fetch("/api/plano/selecionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: plan.id }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={selectPlan}
      disabled={loading}
      className="candle-flame card-soft w-full px-5 py-4 text-left group flex items-center justify-between disabled:opacity-50"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <p className="font-serif text-[#c9c0a8] text-base group-hover:text-[#e2d9c5] transition-colors">{plan.label}</p>
        <p className="text-[#55524a] text-xs mt-0.5">{plan.desc}</p>
      </div>
      <span className="text-[#3d3a55] group-hover:text-[#c9a654] text-xs transition-colors font-serif">
        {loading ? "…" : "Selecionar →"}
      </span>
    </button>
  )
}
