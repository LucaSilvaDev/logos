"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import {
  LANDING_BRAND,
  LANDING_NAV,
  LANDING_TOPICS,
  topicCta,
} from "@/lib/landing-topics"
import "./editorial-landing.css"

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)"

function BrandMark() {
  return (
    <svg className="el-mark" viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="15" fill="#17191c" />
      <circle cx="16" cy="16" r="7.5" fill="none" stroke="#fbe1d1" strokeWidth="1.4" />
      <path d="M16 8.2v15.6" stroke="#f7f4ef" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// Revela um elemento com um giro 3D sutil assim que ele entra na viewport
// (inspirado no efeito "rolling text on scroll" — sem depender de libs de animação).
function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("is-revealed")
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed")
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return ref
}

function RevealGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealOnScroll<HTMLDivElement>()
  return (
    <div ref={ref} className={`el-reveal ${className}`}>
      {children}
    </div>
  )
}

export default function EditorialLanding() {
  const tabsId = useId()
  const galleryRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const [topicIndex, setTopicIndex] = useState(0)
  const [activeCard, setActiveCard] = useState(1)
  const [pinnedCard, setPinnedCard] = useState<number | null>(null)
  const [swapKey, setSwapKey] = useState(0)
  const [heroOffset, setHeroOffset] = useState(0)

  const topic = LANDING_TOPICS[topicIndex]

  function selectTopic(index: number) {
    if (index === topicIndex) return
    setTopicIndex(index)
    setActiveCard(1)
    setPinnedCard(null)
    setSwapKey((k) => k + 1)
  }

  function activateCard(index: number, pin = false) {
    setActiveCard(index)
    if (pin) setPinnedCard(index)
  }

  function onTabKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return
    e.preventDefault()
    const last = LANDING_TOPICS.length - 1
    const next =
      e.key === "Home" ? 0
      : e.key === "End" ? last
      : e.key === "ArrowRight" ? (topicIndex + 1) % LANDING_TOPICS.length
      : (topicIndex - 1 + LANDING_TOPICS.length) % LANDING_TOPICS.length
    selectTopic(next)
  }

  useEffect(() => {
    const node = galleryRef.current?.querySelector<HTMLElement>(`[data-card="${activeCard}"]`)
    if (node && window.matchMedia("(max-width: 720px)").matches) {
      node.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" })
    }
  }, [activeCard, topicIndex])

  // Parallax sutil da foto de fundo do hero conforme a página rola.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    function onScroll() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const node = heroRef.current
        if (!node) return
        const rect = node.getBoundingClientRect()
        setHeroOffset(Math.max(-40, Math.min(40, rect.top * -0.08)))
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div className="el">
      <div className="el-glow" aria-hidden />

      <header className="el-header el-rise">
        <Link href="/" className="el-brand" aria-label={LANDING_BRAND}>
          <BrandMark />
          <span className="el-brand-name">{LANDING_BRAND}</span>
        </Link>

        <nav className="el-nav" aria-label="Principal">
          {LANDING_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="el-actions">
          <Link href="/entrar" className="el-btn-text">
            Entrar
          </Link>
          <Link href="/biblia" className="el-btn-fill">
            Ler a Bíblia
          </Link>
        </div>
      </header>

      <main className="el-main">
        <section className="el-hero" ref={heroRef} aria-labelledby="el-heading">
          <div className="el-hero-bg" aria-hidden style={{ transform: `translate3d(0, ${heroOffset}px, 0) scale(1.12)` }}>
            <Image
              src="/images/landing/jerusalem.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover" }}
            />
            <div className="el-hero-scrim" />
          </div>

          <p className="el-eyebrow el-rise el-d1">Bíblia · devoção · estudo</p>
          <h1 id="el-heading" className="el-title el-rise el-d2">
            <span className="el-title-lead">Abra a Escritura</span>
            <span key={topic.id} className="el-title-shift is-roll">
              {topic.headline}
            </span>
          </h1>

          <div className="el-tabs-wrap el-rise el-d3">
            <div
              className="el-tabs"
              role="tablist"
              aria-label="Temas de leitura"
              onKeyDown={onTabKey}
            >
              {LANDING_TOPICS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`${tabsId}-tab-${item.id}`}
                  aria-selected={index === topicIndex}
                  aria-controls="insights"
                  tabIndex={index === topicIndex ? 0 : -1}
                  className="el-tab"
                  onClick={() => selectTopic(index)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          id="insights"
          ref={galleryRef}
          className="el-gallery"
          role="tabpanel"
          aria-labelledby={`${tabsId}-tab-${topic.id}`}
          onMouseLeave={() => setActiveCard(pinnedCard ?? 1)}
        >
          {topic.cards.map((card, index) => {
            const isActive = activeCard === index
            return (
              <RevealGroup key={`${swapKey}-${topic.id}-${index}`} className="el-reveal-card" >
                <Link
                  href={topic.href}
                  data-card={index}
                  className={`el-card el-swap${isActive ? " is-active" : ""}`}
                  onMouseEnter={() => activateCard(index)}
                  onFocus={() => activateCard(index)}
                  onClick={() => activateCard(index, true)}
                  style={{ transitionTimingFunction: EASE, transitionDelay: `${index * 60}ms` }}
                >
                  <div className="el-card-art" aria-hidden>
                    <Image
                      src={topic.image}
                      alt=""
                      fill
                      sizes="(max-width: 720px) 84vw, (max-width: 1100px) 50vw, 25vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <p className="el-card-label">{card.label}</p>
                  <h2 className="el-card-title">{card.title}</h2>
                  <p className="el-card-copy">{card.description}</p>
                  <div className="el-card-foot">
                    <p className="el-card-meta">{topicCta(topic.href)}</p>
                    <span className="el-card-icon" aria-hidden>
                      <ArrowUpRight size={14} strokeWidth={1.6} />
                    </span>
                  </div>
                </Link>
              </RevealGroup>
            )
          })}
        </section>

        <section className="el-plates" aria-label="Terra Santa em imagens">
          <RevealGroup className="el-plate el-plate-tall">
            <div className="el-plate-media">
              <Image
                src="/images/landing/cruz.jpg"
                alt="Cruz de madeira no topo de uma colina ao pôr do sol"
                fill
                sizes="(max-width: 900px) 100vw, 42vw"
                style={{ objectFit: "cover" }}
              />
            </div>
            <p className="el-plate-quote">
              “Se alguém quer vir após mim, negue-se a si mesmo, tome a sua cruz e siga-me.”
              <span>Mateus 16:24</span>
            </p>
          </RevealGroup>

          <div className="el-plate-col">
            <RevealGroup className="el-plate">
              <div className="el-plate-media">
                <Image
                  src="/images/landing/arvore-colina.jpg"
                  alt="Árvore solitária no topo de uma colina rochosa"
                  fill
                  sizes="(max-width: 900px) 100vw, 42vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <p className="el-plate-quote">
                “Aquietai-vos, e sabei que eu sou Deus.”
                <span>Salmos 46:10</span>
              </p>
            </RevealGroup>

            <RevealGroup className="el-plate">
              <div className="el-plate-media">
                <Image
                  src="/images/landing/mar-galileia.jpg"
                  alt="Barco no Mar da Galileia"
                  fill
                  sizes="(max-width: 900px) 100vw, 42vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <p className="el-plate-quote">
                “Vinde após mim, e eu vos farei pescadores de homens.”
                <span>Mateus 4:19</span>
              </p>
            </RevealGroup>
          </div>
        </section>

        <p className="el-credit">
          Fotos: Unsplash
        </p>
      </main>
    </div>
  )
}
