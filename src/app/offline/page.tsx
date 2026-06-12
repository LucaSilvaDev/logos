"use client"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#121214] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1c1c1f] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a654" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 1l22 22" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" fill="#c9a654" stroke="none" />
        </svg>
      </div>

      <h1 className="font-display text-[#e2d9c5] text-xl tracking-wide mb-3">Sem conexão</h1>
      <p className="text-[#55524a] text-sm font-serif leading-relaxed max-w-xs mb-8">
        Os capítulos já lidos estão disponíveis offline. Conecte-se para continuar.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 border border-[#c9a654]/30 text-[#c9a654] text-sm font-serif rounded-xl hover:bg-[#c9a654]/10 transition-colors touch-manipulation"
      >
        Tentar novamente
      </button>
    </div>
  )
}
