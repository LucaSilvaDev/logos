"use client"

import { useState } from "react"
import { FileDown, Loader2 } from "lucide-react"

interface Props {
  href: string
  className?: string
}

export function PdfDownloadButton({ href, className }: Props) {
  const [loading, setLoading] = useState(false)

  async function download() {
    setLoading(true)
    try {
      const res  = await fetch(href)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement("a")
      // Extract filename from Content-Disposition header if available
      const cd   = res.headers.get("Content-Disposition") ?? ""
      const m    = cd.match(/filename="([^"]+)"/)
      a.download = m?.[1] ?? "selah.pdf"
      a.href     = url
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* silent — network errors */ }
    finally { setLoading(false) }
  }

  return (
    <button
      onClick={download}
      disabled={loading}
      className={className ?? "flex items-center gap-1.5 text-xs text-[#55524a] hover:text-[#8a8375] transition-colors font-serif disabled:opacity-50"}
      title="Exportar PDF"
    >
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <FileDown className="w-3.5 h-3.5" />
      }
      {loading ? "Gerando…" : "PDF"}
    </button>
  )
}
