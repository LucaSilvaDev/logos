"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowDown, ArrowRight, ChevronUp, Info, X } from "lucide-react"
import { useVideoScrub } from "@/hooks/useVideoScrub"

const DARK = "#1D3045"
const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260821_114821_a8ca298f-be2c-4613-a4dd-51b69e16bbde.mp4"

const NAV_LINKS = [
  { label: "SELAH", href: "/", active: true },
  { label: "BÍBLIA", href: "/biblia", active: false },
  { label: "PLANO", href: "/plano", active: false },
  { label: "DEVOCIONAL", href: "/devocional", active: false },
  { label: "ESTUDO", href: "/estudo", active: false },
] as const

const EASE_OUT_EXPO = "cubic-bezier(0.16,1,0.3,1)"
const EASE_OVERLAY = "cubic-bezier(0.4,0,0.2,1)"

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function s1Opacity(p: number) {
  if (p < 0.2) return 1
  return Math.max(0, 1 - (p - 0.2) / 0.08)
}

function s2Opacity(p: number) {
  if (p < 0.32) return 0
  if (p < 0.4) return (p - 0.32) / 0.08
  if (p < 0.55) return 1
  return Math.max(0, 1 - (p - 0.55) / 0.08)
}

function s3Opacity(p: number) {
  if (p < 0.67) return 0
  if (p < 0.75) return (p - 0.67) / 0.08
  return 1
}

function Stagger({
  visible,
  delay,
  children,
  className,
}: {
  visible: boolean
  delay: number
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.8s ${EASE_OUT_EXPO} ${delay}ms, transform 0.8s ${EASE_OUT_EXPO} ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function Navbar({ isLight, onOpenMenu }: { isLight: boolean; onOpenMenu: () => void }) {
  const [entered, setEntered] = useState(false)
  const color = isLight ? "#ffffff" : DARK

  useEffect(() => {
    const id = window.setTimeout(() => setEntered(true), 200)
    return () => window.clearTimeout(id)
  }, [])

  const linkEnter = (delayMs: number) => ({
    opacity: entered ? 1 : 0,
    transform: entered ? "translateY(0)" : "translateY(-12px)",
    transition: `opacity 0.6s ${EASE_OUT_EXPO} ${delayMs}ms, transform 0.6s ${EASE_OUT_EXPO} ${delayMs}ms, color 500ms`,
    color,
  })

  return (
    <nav
      className="absolute top-0 z-50 w-full pointer-events-auto px-6 sm:px-8 md:px-12 pt-8 sm:pt-12 pb-6 flex items-center justify-between transition-colors duration-500"
      style={{ color }}
    >
      <button
        type="button"
        aria-label="Abrir menu"
        onClick={onOpenMenu}
        className="flex flex-col lg:hidden"
        style={{ gap: 5, color }}
      >
        <span className="block h-[2px] w-6 transition-colors duration-500" style={{ backgroundColor: color }} />
        <span className="block h-[2px] w-6 transition-colors duration-500" style={{ backgroundColor: color }} />
        <span className="block h-[2px] w-4 transition-colors duration-500" style={{ backgroundColor: color }} />
      </button>

      <div className="hidden lg:flex items-center gap-8 xl:gap-10">
        {NAV_LINKS.map((item, i) => (
          <Link
            key={item.label}
            href={item.href}
            className="relative text-xs tracking-[0.15em] uppercase font-medium hover:opacity-70"
            style={linkEnter(i * 80 + 100)}
          >
            {item.label}
            {item.active ? (
              <span className="absolute left-0 right-0 -bottom-3 h-[2px]" style={{ backgroundColor: color }} />
            ) : null}
          </Link>
        ))}
      </div>

      <div className="hidden sm:flex items-center gap-8" style={linkEnter(500)}>
        <Link href="/busca" className="flex items-center gap-3">
          <span className="text-xs tracking-[0.2em] uppercase font-medium">Busca</span>
          <span
            className="flex items-center justify-center rounded-full"
            style={{ width: 20, height: 20, backgroundColor: color }}
          >
            <Info size={10} style={{ color: isLight ? DARK : "#ffffff" }} />
          </span>
        </Link>
        <span className="hidden lg:inline text-xs tracking-[0.2em] uppercase font-medium">Menu</span>
        <button
          type="button"
          onClick={onOpenMenu}
          className="lg:hidden text-xs tracking-[0.2em] uppercase font-medium"
        >
          Menu
        </button>
      </div>
    </nav>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div
      className={`fixed inset-0 z-[100] ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
      style={{
        backgroundColor: DARK,
        transition: `opacity 500ms ${EASE_OVERLAY}, visibility 500ms ${EASE_OVERLAY}`,
      }}
    >
      <div
        className={`flex h-full flex-col ${open ? "translate-y-0" : "-translate-y-8"}`}
        style={{ transition: `transform 500ms ${EASE_OVERLAY}` }}
      >
        <div className="flex justify-end px-6 sm:px-8 pt-8 sm:pt-12">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:border-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-start justify-center px-8 sm:px-12">
          {NAV_LINKS.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`py-3 text-2xl sm:text-3xl font-light tracking-wide uppercase ${
                item.active ? "text-white" : "text-white/60 hover:text-white"
              }`}
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 500ms ${EASE_OVERLAY} ${i * 60}ms, transform 500ms ${EASE_OVERLAY} ${i * 60}ms`,
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-8 px-8 sm:px-12 pb-10 text-xs tracking-[0.2em] uppercase text-white/60">
          <Link href="/entrar" onClick={onClose}>
            Entrar
          </Link>
          <Link href="/cadastro" onClick={onClose}>
            Cadastro
          </Link>
        </div>
      </div>
    </div>
  )
}

export function CinematicLanding() {
  const { videoRef, canvasRef, containerRef, scrollProgress: p, canvasLive } = useVideoScrub(VIDEO_SRC)
  const [menuOpen, setMenuOpen] = useState(false)
  const isLight = p > 0.55
  const o1 = clamp01(s1Opacity(p))
  const o2 = clamp01(s2Opacity(p))
  const o3 = clamp01(s3Opacity(p))

  return (
    <div ref={containerRef} className="relative h-[500vh] cinematic-root">
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            canvasLive ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="absolute inset-0 pointer-events-none">
          <Navbar isLight={isLight} onOpenMenu={() => setMenuOpen(true)} />

          <section
            className="absolute inset-0 flex items-center"
            style={{ opacity: o1, transition: "opacity 0.1s ease-out" }}
          >
            <div className="px-6 sm:px-8 md:px-20 lg:px-32">
              <Stagger visible={o1 > 0.3} delay={0}>
                <h1
                  className="font-light uppercase leading-[1.2]"
                  style={{ fontSize: "clamp(2rem,5vw,5rem)", color: DARK }}
                >
                  A palavra, com espaço para respirar
                </h1>
              </Stagger>
              <Stagger visible={o1 > 0.3} delay={150}>
                <p className="mt-6 text-sm tracking-[0.3em] uppercase" style={{ color: `${DARK}90` }}>
                  Leitura, plano e meditação
                </p>
              </Stagger>
            </div>
            <Stagger
              visible={o1 > 0.3}
              delay={300}
              className="pointer-events-auto absolute bottom-12 right-6 sm:right-8 md:right-12"
            >
              <Link
                href="/entrar"
                aria-label="Entrar"
                className="flex h-12 w-12 items-center justify-center rounded-full hover:opacity-70"
                style={{ border: `1px solid ${DARK}80` }}
              >
                <ArrowRight size={18} color={DARK} />
              </Link>
            </Stagger>
          </section>

          <section
            className="absolute inset-0 flex items-center justify-center px-6 sm:px-8"
            style={{ opacity: o2, transition: "opacity 0.1s ease-out" }}
          >
            <Stagger visible={o2 > 0.3} delay={0} className="max-w-[900px]">
              <h2
                className="text-center font-extralight uppercase tracking-wide leading-[1.3]"
                style={{ fontSize: "clamp(1.5rem,4.5vw,4.5rem)", color: DARK }}
              >
                Formamos hábitos duradouros na Escritura{" "}
                <span style={{ color: `${DARK}CC` }}>com precisão</span>{" "}
                <span style={{ color: `${DARK}80` }}>em cada versículo</span>
              </h2>
            </Stagger>
            <div className="pointer-events-auto absolute bottom-16 right-6 sm:right-8 md:right-12 flex flex-col items-center gap-4">
              <Stagger visible={o2 > 0.3} delay={200}>
                <button
                  type="button"
                  aria-label="Rolar"
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ border: `1px solid ${DARK}66` }}
                  onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
                >
                  <ArrowDown size={18} color={DARK} />
                </button>
              </Stagger>
              <Stagger visible={o2 > 0.3} delay={350}>
                <div className="mt-4 flex flex-col items-center gap-2">
                  <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: DARK }} />
                  <span className="block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `${DARK}66` }} />
                  <span className="block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `${DARK}66` }} />
                </div>
              </Stagger>
              <Stagger visible={o2 > 0.3} delay={500}>
                <button
                  type="button"
                  aria-label="Voltar ao topo"
                  className="mt-2 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ border: `1px solid ${DARK}4D`, color: `${DARK}CC` }}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  <ChevronUp size={16} />
                </button>
              </Stagger>
            </div>
          </section>

          <section
            className="absolute inset-0 flex items-center justify-end px-6 sm:px-8 md:px-20 lg:px-32"
            style={{ opacity: o3, transition: "opacity 0.1s ease-out" }}
          >
            <div className="max-w-2xl text-left">
              <Stagger visible={o3 > 0.3} delay={0}>
                <p className="mb-4 text-lg tracking-wide text-white/60">Selah | Escritura</p>
              </Stagger>
              <Stagger visible={o3 > 0.3} delay={150}>
                <h2
                  className="mb-8 font-light uppercase tracking-wide leading-[1.2] text-white"
                  style={{ fontSize: "clamp(2rem,4vw,4rem)" }}
                >
                  Alimentando fé,
                  <br />
                  formando o amanhã.
                </h2>
              </Stagger>
              <Stagger visible={o3 > 0.3} delay={300}>
                <div className="pointer-events-auto flex items-center gap-4">
                  <Link href="/entrar" className="text-sm tracking-[0.3em] uppercase text-white/80">
                    Entrar no Selah
                  </Link>
                  <Link
                    href="/cadastro"
                    aria-label="Criar conta"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 transition-transform duration-300 hover:scale-110"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </Stagger>
            </div>
          </section>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}
