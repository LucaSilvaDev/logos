"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

export default function CancelPlan() {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function cancel() {
    setLoading(true)
    await fetch("/api/plano/cancelar", { method: "POST" })
    router.refresh()
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 text-[10px] text-[#3d3a55] hover:text-[#8a8375] transition-colors font-serif">
        <X className="w-3 h-3" /> Cancelar este plano
      </button>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="font-serif text-[#8a8375] text-xs italic">Confirmar? O progresso será apagado.</span>
      <button onClick={cancel} disabled={loading}
        className="text-xs text-[#8a7055] hover:opacity-80 font-serif disabled:opacity-40">
        {loading ? "…" : "Sim, cancelar"}
      </button>
      <button onClick={() => setConfirming(false)}
        className="text-xs text-[#3d3a55] hover:opacity-80 font-serif">
        Não
      </button>
    </div>
  )
}
