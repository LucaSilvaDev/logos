"use client"

import { useState, useEffect } from "react"
import { Save, Bell, BellOff, User, ChevronLeft, Check, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const THEOLOGICAL_LINES = [
  "Reformado", "Presbiteriano", "Batista Reformado", "Anglicano", "Luterano", "Metodista",
]
const CALVIN_POINTS = [
  "TULIP — 5 Pontos", "4 Pontos (Amiraldismo)", "Sem posição definida",
]
const ESCHATOLOGY = [
  "Pós-Tribulacionista · Pré-Milenista Histórico",
  "Pré-Tribulacionista · Pré-Milenista Dispensacional",
  "Amilenista",
  "Pós-Milenista",
  "Sem posição definida",
]
const VERSIONS = [
  { id: "nvi", label: "NVI" },
  { id: "naa", label: "NAA" },
  { id: "nvt", label: "NVT" },
]

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw     = window.atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

function localTimeToUtc(localHHMM: string): string {
  const [hh, mm] = localHHMM.split(":").map(Number)
  const d = new Date()
  d.setHours(hh, mm, 0, 0)
  return `${d.getUTCHours().toString().padStart(2, "0")}:${d.getUTCMinutes().toString().padStart(2, "0")}`
}

function utcTimeToLocal(utcHHMM: string): string {
  const [hh, mm] = utcHHMM.split(":").map(Number)
  const d = new Date()
  d.setUTCHours(hh, mm, 0, 0)
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
}

function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (typeof Notification !== "undefined") setPermission(Notification.permission)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(reg =>
        reg.pushManager.getSubscription().then(sub => setSubscribed(!!sub))
      )
    }
  }, [])

  async function subscribe() {
    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    if (existing) { setSubscribed(true); return }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    })

    setPermission("granted")
    setSubscribed(true)
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
      await sub.unsubscribe()
    }
    setSubscribed(false)
  }

  return { permission, subscribed, subscribe, unsubscribe }
}

interface Props {
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
}

export function PerfilClient({ userName, userEmail, userImage }: Props) {
  const { permission, subscribed, subscribe, unsubscribe } = useNotification()

  const [theologicalLine,     setTheologicalLine]     = useState("Reformado")
  const [calvinPoints,        setCalvinPoints]         = useState("TULIP — 5 Pontos")
  const [eschatologyPosition, setEschatologyPosition] = useState("Pós-Tribulacionista · Pré-Milenista Histórico")
  const [preferredVersions,   setPreferredVersions]   = useState(["nvi"])
  const [dailyReminderTime,   setDailyReminderTime]   = useState("")
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  useEffect(() => {
    fetch("/api/perfil").then(r => r.json()).then(d => {
      if (!d) return
      if (d.theologicalLine)     setTheologicalLine(d.theologicalLine)
      if (d.calvinPoints)        setCalvinPoints(d.calvinPoints)
      if (d.eschatologyPosition) setEschatologyPosition(d.eschatologyPosition)
      if (d.preferredVersions)   setPreferredVersions(d.preferredVersions.split(",").filter(Boolean))
      if (d.dailyReminderTime)   setDailyReminderTime(utcTimeToLocal(d.dailyReminderTime))
    })
  }, [])

  function toggleVersion(id: string) {
    setPreferredVersions(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    )
  }

  async function save() {
    setSaving(true)
    await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theologicalLine,
        calvinPoints,
        eschatologyPosition,
        preferredVersions: preferredVersions.join(","),
        dailyReminderTime: dailyReminderTime ? localTimeToUtc(dailyReminderTime) : null,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleNotification() {
    if (subscribed) {
      await unsubscribe()
    } else {
      if (permission === "denied") return
      await subscribe()
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8 space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-[#3d3a55] hover:text-[#8a8375] transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="font-display text-[9px] text-[#c9a654] uppercase tracking-[0.25em]">Configurações</p>
          <h1 className="font-serif text-[#c9c0a8] text-lg">Perfil</h1>
        </div>
      </div>

      {/* User info */}
      <div className="flex items-center gap-4">
        {userImage ? (
          <img src={userImage} alt="" className="w-12 h-12 rounded-full ring-1 ring-[#2e2b42]" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#211f31] border border-[#2e2b42] flex items-center justify-center">
            <User className="w-5 h-5 text-[#55524a]" />
          </div>
        )}
        <div>
          <p className="font-serif text-[#c9c0a8] text-base">{userName}</p>
          <p className="text-[#3d3a55] text-xs">{userEmail}</p>
        </div>
      </div>

      <div className="h-px bg-[#2e2b42]" />

      {/* Posição Teológica */}
      <section className="space-y-5">
        <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em]">Posição Teológica</p>

        <div className="space-y-2">
          <label className="text-xs text-[#55524a]">Linha teológica</label>
          <div className="flex flex-wrap gap-2">
            {THEOLOGICAL_LINES.map(v => (
              <button key={v} type="button" onClick={() => setTheologicalLine(v)}
                className={cn(
                  "px-3 py-1.5 text-[11px] rounded-xl border transition-colors",
                  theologicalLine === v
                    ? "bg-[#c9a65415] text-[#c9a654] border-[#c9a65440]"
                    : "border-[#2e2b42] text-[#3d3a55] hover:text-[#55524a]"
                )}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[#55524a]">Soteriologia</label>
          <div className="flex flex-wrap gap-2">
            {CALVIN_POINTS.map(v => (
              <button key={v} type="button" onClick={() => setCalvinPoints(v)}
                className={cn(
                  "px-3 py-1.5 text-[11px] rounded-xl border transition-colors",
                  calvinPoints === v
                    ? "bg-[#c9a65415] text-[#c9a654] border-[#c9a65440]"
                    : "border-[#2e2b42] text-[#3d3a55] hover:text-[#55524a]"
                )}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[#55524a]">Escatologia</label>
          <div className="flex flex-col gap-1.5">
            {ESCHATOLOGY.map(v => (
              <button key={v} type="button" onClick={() => setEschatologyPosition(v)}
                className={cn(
                  "px-3 py-2 text-[11px] rounded-xl border text-left transition-colors",
                  eschatologyPosition === v
                    ? "bg-[#c9a65415] text-[#c9a654] border-[#c9a65440]"
                    : "border-[#2e2b42] text-[#3d3a55] hover:text-[#55524a]"
                )}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-[#2e2b42]" />

      {/* Versões preferidas */}
      <section className="space-y-3">
        <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em]">Versões Preferidas</p>
        <div className="flex gap-2">
          {VERSIONS.map(v => (
            <button key={v.id} type="button" onClick={() => toggleVersion(v.id)}
              className={cn(
                "px-4 py-2 text-[11px] rounded-xl border transition-colors",
                preferredVersions.includes(v.id)
                  ? "bg-[#c9a65415] text-[#c9a654] border-[#c9a65440]"
                  : "border-[#2e2b42] text-[#3d3a55] hover:text-[#55524a]"
              )}>
              {v.label}
            </button>
          ))}
        </div>
      </section>

      <div className="h-px bg-[#2e2b42]" />

      {/* Notificações */}
      <section className="space-y-4">
        <p className="font-display text-[9px] text-[#55524a] uppercase tracking-[0.25em]">Lembrete Diário</p>

        <div className="card-soft px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[#c9c0a8] text-sm font-serif">Notificação push</p>
            <p className="text-[#3d3a55] text-xs mt-0.5">
              {permission === "denied"
                ? "Bloqueada no navegador — habilite nas configurações do sistema"
                : subscribed
                  ? "Ativa — receba lembretes no horário configurado"
                  : "Desativada"}
            </p>
          </div>
          <button
            onClick={handleNotification}
            disabled={permission === "denied"}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-colors disabled:opacity-30",
              subscribed
                ? "border-[#c9a65440] text-[#c9a654] bg-[#c9a65415]"
                : "border-[#2e2b42] text-[#55524a] hover:text-[#c9c0a8]"
            )}
          >
            {subscribed ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            {subscribed ? "Ativada" : "Ativar"}
          </button>
        </div>

        {subscribed && (
          <div className="space-y-1.5">
            <label className="text-xs text-[#55524a]">Horário do lembrete</label>
            <input
              type="time"
              value={dailyReminderTime}
              onChange={e => setDailyReminderTime(e.target.value)}
              className="app-input px-4 py-2 text-sm w-40"
            />
            <p className="text-[#3d3a55] text-[10px]">Horário local · salvo com o perfil</p>
          </div>
        )}
      </section>

      <div className="h-px bg-[#2e2b42]" />

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="btn-gold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {saved
            ? <><Check className="w-4 h-4" /> Salvo</>
            : <><Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar Perfil"}</>
          }
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/entrar" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-[#55524a] hover:text-[#e07070] border border-[#2e2b42] hover:border-[#e07070]/30 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
