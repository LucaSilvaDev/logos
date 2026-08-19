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

export default function PlanSetup({ plan }: { plan: Plan }) {
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
      className="mist-row w-full text-left group disabled:opacity-50"
    >
      <div>
        <p className="text-[17px] text-[#17191c]">{plan.label}</p>
        <p className="text-[14px] text-[#777b86] mt-0.5">{plan.desc}</p>
      </div>
      <span className="text-[14px] text-[#979799] group-hover:text-[#17191c] transition-colors">
        {loading ? "…" : "Selecionar →"}
      </span>
    </button>
  )
}
