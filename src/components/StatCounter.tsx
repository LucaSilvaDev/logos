"use client"

import { useEffect, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"

interface Props {
  label: string
  value: number
  icon: LucideIcon
}

export function StatCounter({ label, value, icon: Icon }: Props) {
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current || value === 0) { setDisplay(value); return }
    started.current = true
    const duration = 900
    const start = performance.now()
    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])

  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-3.5 h-3.5 text-[#3d3a55]" />
      <div>
        <p className="text-xl font-semibold text-[#e2d9c5] leading-none tabular-nums">{display}</p>
        <p className="text-[10px] text-[#55524a] mt-0.5">{label}</p>
      </div>
    </div>
  )
}
