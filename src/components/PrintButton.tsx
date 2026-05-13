"use client"

import { Printer } from "lucide-react"

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 text-xs text-[#55524a] hover:text-[#8a8375] transition-colors font-serif"
      title="Imprimir / Salvar PDF"
    >
      <Printer className="w-3.5 h-3.5" /> PDF
    </button>
  )
}
