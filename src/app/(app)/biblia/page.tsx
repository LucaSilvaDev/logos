"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft, ChevronRight, Search, Bookmark,
  X, Loader2, AlertCircle, BookOpen, ChevronDown,
  Maximize2, Minimize2, Trash2, PenLine, Share2, Copy, Check, MessageSquare,
  ArrowLeftRight
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BOOK_ID_NAMES } from "@/lib/reading-plan"
import { BOOK_CATEGORIES, AT_GROUPS, NT_GROUPS, getBookCategory } from "@/lib/bible-categories"

const BOOKS = [
  { id: "GEN",  name: "Gênesis",           chapters: 50,  testament: "AT" },
  { id: "EXO",  name: "Êxodo",             chapters: 40,  testament: "AT" },
  { id: "LEV",  name: "Levítico",          chapters: 27,  testament: "AT" },
  { id: "NUM",  name: "Números",           chapters: 36,  testament: "AT" },
  { id: "DEU",  name: "Deuteronômio",      chapters: 34,  testament: "AT" },
  { id: "JOS",  name: "Josué",             chapters: 24,  testament: "AT" },
  { id: "JDG",  name: "Juízes",            chapters: 21,  testament: "AT" },
  { id: "RUT",  name: "Rute",              chapters: 4,   testament: "AT" },
  { id: "1SA",  name: "1 Samuel",          chapters: 31,  testament: "AT" },
  { id: "2SA",  name: "2 Samuel",          chapters: 24,  testament: "AT" },
  { id: "1KI",  name: "1 Reis",            chapters: 22,  testament: "AT" },
  { id: "2KI",  name: "2 Reis",            chapters: 25,  testament: "AT" },
  { id: "1CH",  name: "1 Crônicas",        chapters: 29,  testament: "AT" },
  { id: "2CH",  name: "2 Crônicas",        chapters: 36,  testament: "AT" },
  { id: "EZR",  name: "Esdras",            chapters: 10,  testament: "AT" },
  { id: "NEH",  name: "Neemias",           chapters: 13,  testament: "AT" },
  { id: "EST",  name: "Ester",             chapters: 10,  testament: "AT" },
  { id: "JOB",  name: "Jó",               chapters: 42,  testament: "AT" },
  { id: "PSA",  name: "Salmos",            chapters: 150, testament: "AT" },
  { id: "PRO",  name: "Provérbios",        chapters: 31,  testament: "AT" },
  { id: "ECC",  name: "Eclesiastes",       chapters: 12,  testament: "AT" },
  { id: "SNG",  name: "Cânticos",          chapters: 8,   testament: "AT" },
  { id: "ISA",  name: "Isaías",            chapters: 66,  testament: "AT" },
  { id: "JER",  name: "Jeremias",          chapters: 52,  testament: "AT" },
  { id: "LAM",  name: "Lamentações",       chapters: 5,   testament: "AT" },
  { id: "EZK",  name: "Ezequiel",          chapters: 48,  testament: "AT" },
  { id: "DAN",  name: "Daniel",            chapters: 12,  testament: "AT" },
  { id: "HOS",  name: "Oséias",            chapters: 14,  testament: "AT" },
  { id: "JOL",  name: "Joel",              chapters: 3,   testament: "AT" },
  { id: "AMO",  name: "Amós",              chapters: 9,   testament: "AT" },
  { id: "OBA",  name: "Obadias",           chapters: 1,   testament: "AT" },
  { id: "JON",  name: "Jonas",             chapters: 4,   testament: "AT" },
  { id: "MIC",  name: "Miquéias",          chapters: 7,   testament: "AT" },
  { id: "NAH",  name: "Naum",              chapters: 3,   testament: "AT" },
  { id: "HAB",  name: "Habacuque",         chapters: 3,   testament: "AT" },
  { id: "ZEP",  name: "Sofonias",          chapters: 3,   testament: "AT" },
  { id: "HAG",  name: "Ageu",              chapters: 2,   testament: "AT" },
  { id: "ZEC",  name: "Zacarias",          chapters: 14,  testament: "AT" },
  { id: "MAL",  name: "Malaquias",         chapters: 4,   testament: "AT" },
  { id: "MAT",  name: "Mateus",            chapters: 28,  testament: "NT" },
  { id: "MRK",  name: "Marcos",            chapters: 16,  testament: "NT" },
  { id: "LUK",  name: "Lucas",             chapters: 24,  testament: "NT" },
  { id: "JHN",  name: "João",              chapters: 21,  testament: "NT" },
  { id: "ACT",  name: "Atos",              chapters: 28,  testament: "NT" },
  { id: "ROM",  name: "Romanos",           chapters: 16,  testament: "NT" },
  { id: "1CO",  name: "1 Coríntios",       chapters: 16,  testament: "NT" },
  { id: "2CO",  name: "2 Coríntios",       chapters: 13,  testament: "NT" },
  { id: "GAL",  name: "Gálatas",           chapters: 6,   testament: "NT" },
  { id: "EPH",  name: "Efésios",           chapters: 6,   testament: "NT" },
  { id: "PHP",  name: "Filipenses",        chapters: 4,   testament: "NT" },
  { id: "COL",  name: "Colossenses",       chapters: 4,   testament: "NT" },
  { id: "1TH",  name: "1 Tessalonicenses", chapters: 5,   testament: "NT" },
  { id: "2TH",  name: "2 Tessalonicenses", chapters: 3,   testament: "NT" },
  { id: "1TI",  name: "1 Timóteo",         chapters: 6,   testament: "NT" },
  { id: "2TI",  name: "2 Timóteo",         chapters: 4,   testament: "NT" },
  { id: "TIT",  name: "Tito",              chapters: 3,   testament: "NT" },
  { id: "PHM",  name: "Filemom",           chapters: 1,   testament: "NT" },
  { id: "HEB",  name: "Hebreus",           chapters: 13,  testament: "NT" },
  { id: "JAS",  name: "Tiago",             chapters: 5,   testament: "NT" },
  { id: "1PE",  name: "1 Pedro",           chapters: 5,   testament: "NT" },
  { id: "2PE",  name: "2 Pedro",           chapters: 3,   testament: "NT" },
  { id: "1JN",  name: "1 João",            chapters: 5,   testament: "NT" },
  { id: "2JN",  name: "2 João",            chapters: 1,   testament: "NT" },
  { id: "3JN",  name: "3 João",            chapters: 1,   testament: "NT" },
  { id: "JUD",  name: "Judas",             chapters: 1,   testament: "NT" },
  { id: "REV",  name: "Apocalipse",        chapters: 22,  testament: "NT" },
]

const VERSIONS = [
  { id: "nvi", label: "NVI", desc: "Nova Versão Internacional" },
  { id: "naa", label: "NAA", desc: "Nova Almeida Atualizada" },
  { id: "nvt", label: "NVT", desc: "Nova Versão Transformadora" },
]

const HL_COLORS = [
  { id: "yellow", style: "#c9a654" },
  { id: "green",  style: "#5a9e72" },
  { id: "blue",   style: "#a09898" },
  { id: "red",    style: "#c96b5a" },
]

const BOOK_MAP = Object.fromEntries(BOOKS.map(b => [b.id, b]))

interface Verse { number: number; text: string; endNumber?: number; heading?: string }
interface HlEntry { id: string; color: string }

function readSavedPos() {
  try {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem("selah-bible-pos")
    if (!raw) return null
    const p = JSON.parse(raw)
    const book = BOOKS.find(b => b.id === p.bookId) ?? null
    if (!book) return null
    const chapter = typeof p.chapter === "number" && p.chapter >= 1 ? p.chapter : 1
    const version = ["nvi", "naa", "nvt"].includes(p.version) ? p.version : "nvi"
    return { book, chapter, version }
  } catch { return null }
}

function readSavedFont(): "sm" | "md" | "lg" {
  try {
    if (typeof window === "undefined") return "md"
    const s = localStorage.getItem("selah-bible-font")
    return s === "sm" || s === "lg" ? s : "md"
  } catch { return "md" }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ")
  let line = ""
  let curY = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY)
      line = word
      curY += lineHeight
    } else { line = test }
  }
  ctx.fillText(line, x, curY)
  return curY
}

function generateVerseImage(verseText: string, verseRef: string): string {
  const S = 1080
  const canvas = document.createElement("canvas")
  canvas.width = S; canvas.height = S
  const ctx = canvas.getContext("2d")!

  // Background
  const bg = ctx.createLinearGradient(0, 0, S, S)
  bg.addColorStop(0, "#16152a"); bg.addColorStop(1, "#0d0c1c")
  ctx.fillStyle = bg; ctx.fillRect(0, 0, S, S)

  // Subtle radial glow
  const glow = ctx.createRadialGradient(S/2, S/2, 0, S/2, S/2, S*0.6)
  glow.addColorStop(0, "rgba(201,166,84,0.07)"); glow.addColorStop(1, "transparent")
  ctx.fillStyle = glow; ctx.fillRect(0, 0, S, S)

  // Gold lines
  const lineGrad = ctx.createLinearGradient(80, 0, S-80, 0)
  lineGrad.addColorStop(0, "transparent")
  lineGrad.addColorStop(0.3, "rgba(201,166,84,0.5)")
  lineGrad.addColorStop(0.7, "rgba(201,166,84,0.5)")
  lineGrad.addColorStop(1, "transparent")
  ctx.fillStyle = lineGrad
  ctx.fillRect(80, 240, S-160, 1)
  ctx.fillRect(80, S-240, S-160, 1)

  // App name top
  ctx.fillStyle = "rgba(201,166,84,0.35)"
  ctx.font = "500 22px 'Georgia', serif"
  ctx.textAlign = "center"
  ctx.letterSpacing = "8px"
  ctx.fillText("SELAH", S/2, 185)

  // Verse text
  ctx.fillStyle = "#c9c0a8"
  ctx.font = `italic 44px 'Georgia', serif`
  ctx.textAlign = "center"
  const endY = wrapText(ctx, `"${verseText}"`, S/2, 340, S-200, 68)

  // Reference
  ctx.fillStyle = "#c9a654"
  ctx.font = "500 30px 'Georgia', serif"
  ctx.fillText(verseRef, S/2, Math.max(endY + 80, 740))

  return canvas.toDataURL("image/png")
}

export default function BibliaPage() {
  const pos0 = readSavedPos()
  const router = useRouter()

  const [book,    setBook]    = useState(() => pos0?.book    ?? BOOKS[0])
  const [chapter, setChapter] = useState(() => pos0?.chapter ?? 1)
  const [version, setVersion] = useState(() => pos0?.version ?? "nvi")
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">(readSavedFont)

  const [tab,    setTab]    = useState<"AT" | "NT">("AT")
  const [filter, setFilter] = useState("")

  const [highlighted, setHighlighted] = useState<Record<string, HlEntry>>({})
  const [bookmarked,  setBookmarked]  = useState<Record<string, string>>({})
  const [verseNotes,  setVerseNotes]  = useState<Record<string, { id: string; text: string }>>({})

  const [noteVerse,   setNoteVerse]   = useState<number | null>(null)
  const [noteText,    setNoteText]    = useState("")
  const [noteSaving,  setNoteSaving]  = useState(false)

  const [chapterNoteOpen,   setChapterNoteOpen]   = useState(false)
  const [chapterNoteText,   setChapterNoteText]   = useState("")
  const [chapterNoteSaving, setChapterNoteSaving] = useState(false)

  const [verses,    setVerses]    = useState<Verse[]>([])
  const [loading,   setLoading]   = useState(false)
  const [apiError,  setApiError]  = useState<"ERROR" | "AUTH_REQUIRED" | "RATE_LIMIT" | null>(null)
  const [apiDetail, setApiDetail] = useState("")
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [animKey,   setAnimKey]   = useState(0)
  const [showBookModal,    setShowBookModal]    = useState(false)
  const [showChapterModal, setShowChapterModal] = useState(false)

  // Focus (fullscreen reading) mode
  const [focusMode, setFocusMode] = useState(false)

  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState(false)

  const [compareOpen,     setCompareOpen]     = useState(false)
  const [compareVerseNum, setCompareVerseNum] = useState<number | null>(null)
  const [compareData,     setCompareData]     = useState<Record<string, string>>({})
  const [compareLoading,  setCompareLoading]  = useState(false)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  // Reading progress bar
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const el = document.querySelector("main") as HTMLElement | null
    if (!el) return
    function onScroll() {
      const { scrollTop, scrollHeight, clientHeight } = el!
      const p = scrollHeight <= clientHeight ? 0 : scrollTop / (scrollHeight - clientHeight)
      setScrollProgress(p)
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  // ESC exits focus mode or clears verse selection
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (compareOpen)                { setCompareOpen(false);      return }
        if (chapterNoteOpen)            { setChapterNoteOpen(false);  return }
        if (noteVerse !== null)         { setNoteVerse(null);         return }
        if (selectedVerses.size > 0)    { setSelectedVerses(new Set()); return }
        if (showChapterModal)           { setShowChapterModal(false); return }
        if (showBookModal)              { setShowBookModal(false);    return }
        if (focusMode) setFocusMode(false)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [focusMode, chapterNoteOpen, noteVerse, selectedVerses, showChapterModal, showBookModal, compareOpen])

  // Persist reading position
  useEffect(() => {
    try {
      localStorage.setItem("selah-bible-pos", JSON.stringify({ bookId: book.id, chapter, version }))
    } catch { /* ignore */ }
  }, [book, chapter, version])

  useEffect(() => {
    try { localStorage.setItem("selah-bible-font", fontSize) } catch { /* ignore */ }
  }, [fontSize])

  // Load highlights
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res  = await fetch(`/api/biblia/highlights?book=${book.id}&chapter=${chapter}&version=${version}`)
        if (!res.ok || !active) return
        const data: { id: string; verseStart: number; verseEnd: number; color: string }[] = await res.json()
        const map: Record<string, HlEntry> = {}
        for (const h of data) {
          for (let v = h.verseStart; v <= h.verseEnd; v++) {
            map[`${book.id}-${chapter}-${v}`] = { id: h.id, color: h.color }
          }
        }
        if (active) setHighlighted(map)
      } catch { /* non-critical */ }
    }
    setHighlighted({})
    load()
    return () => { active = false }
  }, [book, chapter, version])

  // Load bookmarks
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res  = await fetch(`/api/biblia/bookmarks?book=${book.id}&chapter=${chapter}&version=${version}`)
        if (!res.ok || !active) return
        const data: { id: string; verse: number | null }[] = await res.json()
        const map: Record<string, string> = {}
        for (const b of data) {
          if (b.verse != null) map[`${book.id}-${chapter}-${b.verse}`] = b.id
        }
        if (active) setBookmarked(map)
      } catch { /* non-critical */ }
    }
    setBookmarked({})
    load()
    return () => { active = false }
  }, [book, chapter, version])

  // Load verse notes
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res  = await fetch(`/api/biblia/notes?book=${book.id}&chapter=${chapter}&version=${version}`)
        if (!res.ok || !active) return
        const data: { id: string; verse: number; text: string }[] = await res.json()
        const map: Record<string, { id: string; text: string }> = {}
        for (const n of data) map[`${book.id}-${chapter}-${n.verse}`] = { id: n.id, text: n.text }
        if (active) setVerseNotes(map)
      } catch { /* non-critical */ }
    }
    setVerseNotes({})
    setChapterNoteOpen(false)
    load()
    return () => { active = false }
  }, [book, chapter, version])

  const filteredBooks = BOOKS.filter(b =>
    b.testament === tab && b.name.toLowerCase().includes(filter.toLowerCase())
  )

  const chapterCols = book.chapters <= 9 ? 3 : book.chapters <= 30 ? 5 : book.chapters <= 60 ? 6 : 8

  const fetchVerses = useCallback(async () => {
    setLoading(true)
    setApiError(null)
    setVerses([])
    try {
      const res  = await fetch(`/api/biblia?book=${book.id}&chapter=${chapter}&version=${version}`)
      const data = await res.json()
      if (data.error === "AUTH_REQUIRED") { setApiError("AUTH_REQUIRED"); return }
      if (data.error === "RATE_LIMIT")    { setApiError("RATE_LIMIT");    return }
      if (!res.ok || data.error) {
        setApiDetail(data.detail ?? data.error ?? `HTTP ${res.status}`)
        setApiError("ERROR")
        return
      }
      setVerses((data.verses ?? []).map((v: Verse) => ({ number: v.number, text: v.text, endNumber: v.endNumber, heading: v.heading })))
    } catch {
      setApiError("ERROR")
    } finally {
      setLoading(false)
    }
  }, [book, chapter, version])

  useEffect(() => { fetchVerses() }, [fetchVerses])

  function goChapter(delta: number) {
    const next    = chapter + delta
    const bookIdx = BOOKS.findIndex(b => b.id === book.id)
    if (next < 1) {
      if (bookIdx <= 0) return
      const prev = BOOKS[bookIdx - 1]
      setBook(prev); setChapter(prev.chapters); setDirection("prev"); setAnimKey(k => k + 1)
      return
    }
    if (next > book.chapters) {
      if (bookIdx >= BOOKS.length - 1) return
      setBook(BOOKS[bookIdx + 1]); setChapter(1); setDirection("next"); setAnimKey(k => k + 1)
      return
    }
    setDirection(delta > 0 ? "next" : "prev")
    setAnimKey(k => k + 1)
    setChapter(next)
  }

  function changeBook(b: typeof BOOKS[0]) {
    setBook(b); setChapter(1); setDirection("next"); setAnimKey(k => k + 1)
  }

  function openStudyNote(verseNumber: number) {
    const bookName = BOOK_ID_NAMES[book.id] ?? book.name
    router.push(`/estudo/nova?book=${encodeURIComponent(bookName)}&chapter=${chapter}&verse=${verseNumber}`)
  }

  function openNote(verseNumber: number) {
    const key = `${book.id}-${chapter}-${verseNumber}`
    setNoteText(verseNotes[key]?.text ?? "")
    setNoteVerse(verseNumber)
  }

  async function saveNote() {
    if (noteVerse === null) return
    setNoteSaving(true)
    const key = `${book.id}-${chapter}-${noteVerse}`
    try {
      if (!noteText.trim()) {
        const existing = verseNotes[key]
        if (existing) {
          await fetch("/api/biblia/notes", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: existing.id }),
          })
          setVerseNotes(prev => { const n = { ...prev }; delete n[key]; return n })
        }
      } else {
        const res  = await fetch("/api/biblia/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ book: book.id, chapter, verse: noteVerse, version, text: noteText }),
        })
        const data = await res.json()
        if (data?.id) setVerseNotes(prev => ({ ...prev, [key]: { id: data.id, text: noteText } }))
      }
      setNoteVerse(null)
    } finally {
      setNoteSaving(false)
    }
  }

  async function deleteNote(verseNumber: number) {
    const key = `${book.id}-${chapter}-${verseNumber}`
    const existing = verseNotes[key]
    if (!existing) return
    await fetch("/api/biblia/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: existing.id }),
    })
    setVerseNotes(prev => { const n = { ...prev }; delete n[key]; return n })
    setNoteVerse(null)
  }

  function openChapterNote() {
    setNoteVerse(null)
    const key = `${book.id}-${chapter}-0`
    setChapterNoteText(verseNotes[key]?.text ?? "")
    setChapterNoteOpen(true)
  }

  async function saveChapterNote() {
    setChapterNoteSaving(true)
    const key = `${book.id}-${chapter}-0`
    try {
      if (!chapterNoteText.trim()) {
        const existing = verseNotes[key]
        if (existing) {
          await fetch("/api/biblia/notes", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: existing.id }),
          })
          setVerseNotes(prev => { const n = { ...prev }; delete n[key]; return n })
        }
      } else {
        const res  = await fetch("/api/biblia/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ book: book.id, chapter, verse: 0, version, text: chapterNoteText }),
        })
        const data = await res.json()
        if (data?.id) setVerseNotes(prev => ({ ...prev, [key]: { id: data.id, text: chapterNoteText } }))
      }
      setChapterNoteOpen(false)
    } finally {
      setChapterNoteSaving(false)
    }
  }

  async function deleteChapterNote() {
    const key = `${book.id}-${chapter}-0`
    const existing = verseNotes[key]
    if (!existing) return
    await fetch("/api/biblia/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: existing.id }),
    })
    setVerseNotes(prev => { const n = { ...prev }; delete n[key]; return n })
    setChapterNoteText("")
    setChapterNoteOpen(false)
  }

  function selectionRef() {
    const bookName = BOOK_ID_NAMES[book.id] ?? book.name
    const nums = [...selectedVerses].sort((a, b) => a - b)
    if (nums.length === 0) return ""
    if (nums.length === 1) return `${bookName} ${chapter}:${nums[0]}`
    const contiguous = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1)
    if (contiguous) return `${bookName} ${chapter}:${nums[0]}–${nums[nums.length - 1]}`
    return `${bookName} ${chapter}:${nums.join(", ")}`
  }

  function selectionText() {
    return verses
      .filter(v => selectedVerses.has(v.number))
      .sort((a, b) => a.number - b.number)
      .map(v => `${v.number} ${v.text}`)
      .join(" ")
  }

  async function copyVerse() {
    if (selectedVerses.size === 0) return
    await navigator.clipboard.writeText(`${selectionText()}\n— ${selectionRef()}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function shareVerse() {
    if (selectedVerses.size === 0) return
    const shareText = `${selectionText()}\n\n— ${selectionRef()}\n\nSelah`
    if (navigator.share) await navigator.share({ text: shareText }).catch(() => {})
    setSelectedVerses(new Set())
  }

  function downloadVerseImage() {
    if (selectedVerses.size === 0) return
    const text = verses
      .filter(v => selectedVerses.has(v.number))
      .sort((a, b) => a.number - b.number)
      .map(v => v.text)
      .join(" ")
    const dataUrl = generateVerseImage(text, selectionRef())
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `${selectionRef().replace(/\s/g, "_")}.png`
    a.click()
    setSelectedVerses(new Set())
  }

  async function fetchCompare(verseNum: number) {
    setCompareOpen(true)
    setCompareVerseNum(verseNum)
    setCompareLoading(true)
    setCompareData({})
    try {
      const results = await Promise.all(
        VERSIONS.map(v =>
          fetch(`/api/biblia?book=${book.id}&chapter=${chapter}&version=${v.id}`)
            .then(r => r.json())
            .then(data => ({ id: v.id, text: (data.verses ?? []).find((vs: Verse) => vs.number === verseNum)?.text ?? "—" }))
            .catch(() => ({ id: v.id, text: "—" }))
        )
      )
      const map: Record<string, string> = {}
      for (const r of results) map[r.id] = r.text
      setCompareData(map)
    } finally {
      setCompareLoading(false)
    }
  }

  // Toggle verse selection on click
  function handleVerseClick(e: React.MouseEvent, verseNumber: number) {
    e.stopPropagation()
    setSelectedVerses(prev => {
      const next = new Set(prev)
      if (next.has(verseNumber)) next.delete(verseNumber)
      else next.add(verseNumber)
      return next
    })
  }

  async function applyHighlightColor(color: string) {
    const sortedNums = [...selectedVerses].sort((a, b) => a - b)
    if (sortedNums.length === 0) return

    // Snapshot existing highlights before any state update
    const snapshot: Record<number, HlEntry | undefined> = {}
    for (const vn of sortedNums) snapshot[vn] = highlighted[`${book.id}-${chapter}-${vn}`]

    const allSameColor = sortedNums.every(vn => snapshot[vn]?.color === color)

    // Optimistic UI
    setHighlighted(prev => {
      const n = { ...prev }
      for (const vn of sortedNums) {
        const k = `${book.id}-${chapter}-${vn}`
        if (allSameColor) delete n[k]
        else n[k] = { id: snapshot[vn]?.id ?? "pending", color }
      }
      return n
    })
    setSelectedVerses(new Set())

    // API
    for (const vn of sortedNums) {
      const k = `${book.id}-${chapter}-${vn}`
      const existing = snapshot[vn]
      if (allSameColor) {
        if (existing) fetch("/api/biblia/highlights", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: existing.id }) }).catch(() => {})
      } else {
        if (existing) await fetch("/api/biblia/highlights", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: existing.id }) }).catch(() => {})
        const res = await fetch("/api/biblia/highlights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ book: book.id, chapter, verseStart: vn, verseEnd: vn, version, color }) }).catch(() => null)
        const data = res ? await res.json().catch(() => null) : null
        if (data?.id) setHighlighted(prev => ({ ...prev, [k]: { id: data.id, color } }))
      }
    }
  }

  function removeHighlightSelection() {
    const toDelete = [...selectedVerses]
      .map(vn => ({ vn, k: `${book.id}-${chapter}-${vn}`, entry: highlighted[`${book.id}-${chapter}-${vn}`] }))
      .filter(x => !!x.entry)
    setHighlighted(prev => { const n = { ...prev }; for (const { k } of toDelete) delete n[k]; return n })
    setSelectedVerses(new Set())
    for (const { entry } of toDelete) {
      fetch("/api/biblia/highlights", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: entry!.id }) }).catch(() => {})
    }
  }

  async function toggleBookmark(key: string, verseNumber: number) {
    const existingId = bookmarked[key]
    if (existingId) {
      setBookmarked(prev => { const n = { ...prev }; delete n[key]; return n })
      fetch("/api/biblia/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: existingId }),
      }).catch(() => {})
    } else {
      setBookmarked(prev => ({ ...prev, [key]: "pending" }))
      const res  = await fetch("/api/biblia/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book: book.id, chapter, verse: verseNumber, version }),
      }).catch(() => null)
      const data = res ? await res.json().catch(() => null) : null
      if (data?.id) setBookmarked(prev => ({ ...prev, [key]: data.id }))
    }
  }

  const isFirstInBible = book.id === "GEN" && chapter === 1
  const isLastInBible  = book.id === "REV" && chapter === book.chapters

  const bookCat = getBookCategory(book.id)

  const controlsBar = (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 px-6 py-3 bg-[#12111e]/90 backdrop-blur-xl">

      {/* Book selector */}
      <button
        onClick={() => setShowBookModal(true)}
        className="flex items-center gap-2 text-[#c9c0a8] hover:text-[#e2d9c5] transition-colors duration-200 group"
      >
        <BookOpen className="w-3.5 h-3.5 text-[#c9a654] opacity-60" />
        {bookCat && (
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: BOOK_CATEGORIES[bookCat.category].color }} />
        )}
        <span className="font-serif text-sm">{book.name}</span>
        <ChevronDown className="w-3 h-3 text-[#3d3a55] group-hover:text-[#55524a] transition-colors" />
      </button>

      {/* Chapter navigation */}
      <div className="flex items-center gap-1">
        <button onClick={() => goChapter(-1)}
          className="w-6 h-6 flex items-center justify-center text-[#3d3a55] hover:text-[#c9a654] transition-colors duration-200 rounded-lg hover:bg-[#1a1928]">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setShowChapterModal(true)}
          className="flex items-center gap-1 text-[#8a8375] hover:text-[#c9c0a8] transition-colors px-1 group"
        >
          <span className="font-serif text-xs">Cap. {chapter}</span>
          <ChevronDown className="w-3 h-3 text-[#3d3a55] group-hover:text-[#55524a] transition-colors" />
        </button>
        <button onClick={() => goChapter(1)}
          className="w-6 h-6 flex items-center justify-center text-[#3d3a55] hover:text-[#c9a654] transition-colors duration-200 rounded-lg hover:bg-[#1a1928]">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-px h-3.5 bg-[#2e2b42]" />

      {/* Version pills */}
      <div className="flex items-center gap-1">
        {VERSIONS.map(v => (
          <button key={v.id}
            onClick={() => { setDirection("next"); setAnimKey(k => k + 1); setVersion(v.id) }}
            title={v.desc}
            className={cn(
              "px-2.5 py-0.5 text-[10px] font-medium tracking-wider transition-all duration-200 rounded-full border",
              version === v.id
                ? "bg-[#c9a65415] text-[#c9a654] border-[#c9a65440]"
                : "text-[#3d3a55] border-transparent hover:text-[#55524a] hover:border-[#2e2b42]"
            )}>
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Font size */}
      <div className="flex items-center gap-0.5">
        {(["sm", "md", "lg"] as const).map((s, i) => (
          <button key={s}
            onClick={() => setFontSize(s)}
            className={cn(
              "w-6 h-5 flex items-center justify-center rounded transition-colors",
              fontSize === s ? "text-[#c9a654]" : "text-[#3d3a55] hover:text-[#55524a]",
              s === "sm" && "text-[9px]",
              s === "md" && "text-[11px]",
              s === "lg" && "text-[13px]",
            )}
            title={["Texto menor", "Texto médio", "Texto maior"][i]}
          >
            A
          </button>
        ))}
      </div>

      <div className="w-px h-3.5 bg-[#2e2b42]" />

      {/* Search link */}
      <Link href="/biblia/busca"
        className="text-[#3d3a55] hover:text-[#c9a654] transition-colors duration-200"
        title="Buscar versículos">
        <Search className="w-3.5 h-3.5" />
      </Link>

      <div className="w-px h-3.5 bg-[#2e2b42]" />

      {/* Chapter note */}
      <button
        onClick={openChapterNote}
        title="Nota do capítulo"
        className={cn(
          "relative transition-colors duration-200",
          chapterNoteOpen ? "text-[#c9a654]" : "text-[#3d3a55] hover:text-[#c9a654]"
        )}
      >
        <PenLine className="w-3.5 h-3.5" />
        {verseNotes[`${book.id}-${chapter}-0`] && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#c9a654]" />
        )}
      </button>

      <div className="w-px h-3.5 bg-[#2e2b42]" />

      {/* Focus mode toggle */}
      <button
        onClick={() => setFocusMode(f => !f)}
        title={focusMode ? "Sair da leitura focada (Esc)" : "Leitura focada — tela cheia"}
        className="text-[#3d3a55] hover:text-[#c9a654] transition-colors duration-200"
      >
        {focusMode
          ? <Minimize2 className="w-3.5 h-3.5" />
          : <Maximize2 className="w-3.5 h-3.5" />
        }
      </button>
    </div>
  )

  const readingArea = (
    <div
      className="overflow-x-hidden"
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchStartX.current
        const dy = e.changedTouches[0].clientY - touchStartY.current
        if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 60) {
          if (dx < 0 && !isLastInBible) goChapter(1)
          else if (dx > 0 && !isFirstInBible) goChapter(-1)
        }
      }}
    >
      <div className="max-w-2xl mx-auto px-8 py-12">

        {apiError === "AUTH_REQUIRED" && (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="w-6 h-6 text-[#c9a654] opacity-40 mx-auto" />
            <p className="font-serif text-[#c9c0a8] text-base">Token não carregado</p>
            <p className="text-[#55524a] text-sm leading-relaxed max-w-sm mx-auto">
              Reinicie o servidor: <code className="text-[#8a8375] font-mono text-xs">Ctrl+C → npm run dev</code>
            </p>
          </div>
        )}

        {apiError === "RATE_LIMIT" && (
          <div className="relative pl-6 py-4 max-w-sm">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#c9a654] opacity-40" />
            <p className="font-serif text-[#c9a654] text-sm mb-1">Limite de requisições atingido</p>
            <p className="text-[#55524a] text-xs">Aguarde alguns minutos e tente novamente.</p>
          </div>
        )}

        {apiError === "ERROR" && (
          <div className="text-center py-16 space-y-2">
            <AlertCircle className="w-6 h-6 text-[#3d3a55] mx-auto mb-3" />
            <p className="font-serif text-[#55524a] text-sm">Não foi possível carregar os versículos.</p>
            {apiDetail && <p className="font-mono text-[10px] text-[#3d3a55]">{apiDetail}</p>}
            <button onClick={fetchVerses} className="text-xs text-[#c9a654] hover:opacity-80 transition-opacity mt-2 block mx-auto">
              Tentar novamente
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-4 h-4 text-[#3d3a55] animate-spin" />
          </div>
        )}

        {!loading && !apiError && verses.length > 0 && (
          <div key={animKey} className={direction === "next" ? "page-turn-next" : "page-turn-prev"}>

            <div className="text-center mb-12 relative">
              {/* Chapter number watermark */}
              <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden">
                <span className="font-display font-bold leading-none chapter-watermark"
                  style={{ fontSize: "clamp(7rem, 35vw, 16rem)", color: bookCat ? BOOK_CATEGORIES[bookCat.category].color : "#c9a654" }}>
                  {chapter}
                </span>
              </div>
              <h1 className="chapter-heading text-base mb-1">{book.name}</h1>
              <p className="font-sans text-[9px] text-[#3d3a55] tracking-[0.25em] uppercase">
                Capítulo {chapter}
              </p>
              <div className="w-12 h-px mx-auto mt-4" style={{ background: bookCat ? BOOK_CATEGORIES[bookCat.category].color : "#c9a654", opacity: 0.4 }} />
              <div className="flex items-center justify-center gap-2.5 mt-3">
                <span className="text-[9px] text-[#3d3a55] font-mono tabular-nums">{chapter}</span>
                <div className="w-20 h-px bg-[#2e2b42] relative overflow-hidden rounded-full">
                  <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((chapter / book.chapters) * 100)}%`, background: bookCat ? BOOK_CATEGORIES[bookCat.category].color : "#c9a654", opacity: 0.5 }} />
                </div>
                <span className="text-[9px] text-[#3d3a55] font-mono tabular-nums">{book.chapters}</span>
              </div>
            </div>

            <div className={cn(
              "bible-text leading-[2.2]",
              fontSize === "sm" && "bible-text-sm",
              fontSize === "lg" && "bible-text-lg",
            )}>
              {verses.map((v, index) => {
                const key     = `${book.id}-${chapter}-${v.number}`
                const hlEntry = highlighted[key]
                const hlCls   = hlEntry ? `hl-${hlEntry.color}` : ""
                // Stagger first 16 verses; remainder all enter at the same cap delay
                const enterDelay = Math.min(index, 15) * 30
                return (
                  <span key={v.number}>
                    {v.heading && (
                      <span
                        className="verse-enter bible-section-heading"
                        style={{
                          animationDelay: `${enterDelay}ms`,
                          marginTop: index === 0 ? "0.6em" : undefined,
                        }}
                      >
                        {v.heading}
                      </span>
                    )}
                    <span
                      onClick={e => handleVerseClick(e, v.number)}
                      style={{ animationDelay: `${enterDelay}ms` }}
                      className={cn(
                        "verse-enter cursor-pointer transition-colors duration-300 rounded-sm",
                        hlCls,
                        selectedVerses.has(v.number)
                          ? "bg-[#c9a65418] underline decoration-[#c9a654]/35 decoration-1 underline-offset-2"
                          : !hlEntry && "hover:bg-[#c9a65408]"
                      )}>
                      <sup className="verse-number">
                        {v.endNumber && v.endNumber !== v.number ? `${v.number}–${v.endNumber}` : v.number}
                        {verseNotes[`${book.id}-${chapter}-${v.number}`] && (
                          <span className="inline-block w-1 h-1 rounded-full bg-[#c9a654] ml-0.5 opacity-70 translate-y-[-1px]" />
                        )}
                      </sup>
                      <span>{v.text}</span>
                      {" "}
                    </span>
                  </span>
                )
              })}
            </div>

            <div className="flex justify-between mt-16 pt-6 border-t border-[#2e2b42]/40">
              <button onClick={() => goChapter(-1)} disabled={isFirstInBible}
                className="flex items-center gap-1.5 text-sm font-serif text-[#55524a] hover:text-[#c9a654] disabled:opacity-20 transition-colors duration-200">
                <ChevronLeft className="w-4 h-4" />
                {chapter === 1 ? "Livro anterior" : "Capítulo anterior"}
              </button>
              <button onClick={() => goChapter(1)} disabled={isLastInBible}
                className="flex items-center gap-1.5 text-sm font-serif text-[#55524a] hover:text-[#c9a654] disabled:opacity-20 transition-colors duration-200">
                {chapter === book.chapters ? "Próximo livro" : "Próximo capítulo"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Reading progress bar */}
      <div
        className="reading-progress-bar"
        style={{ width: `${scrollProgress * 100}%`, opacity: scrollProgress > 0.01 ? 1 : 0 }}
      />

      {/* Main layout — switches between normal and focus overlay */}
      <div className={cn(
        focusMode
          ? "fixed inset-0 z-50 bg-[#12111e] overflow-y-auto"
          : "relative"
      )}>
        {/* Side chapter nav */}
        {!loading && !apiError && verses.length > 0 && !isFirstInBible && (
          <button onClick={() => goChapter(-1)} className="chapter-side-nav left-0" aria-label="Capítulo anterior">
            <span className="chapter-side-chevron chapter-side-chevron-left" />
          </button>
        )}
        {!loading && !apiError && verses.length > 0 && !isLastInBible && (
          <button onClick={() => goChapter(1)} className="chapter-side-nav right-0" aria-label="Próximo capítulo">
            <span className="chapter-side-chevron chapter-side-chevron-right" />
          </button>
        )}

        {!focusMode && controlsBar}
        {readingArea}

        {/* Immersive mode exit button */}
        {focusMode && (
          <button
            onClick={() => setFocusMode(false)}
            title="Sair do modo imersivo (Esc)"
            className="fixed top-4 right-4 z-[60] w-8 h-8 flex items-center justify-center rounded-full text-[#3d3a55] hover:text-[#8a8375] transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Bottom verse action bar — liquid glass, multi-select */}
      {selectedVerses.size > 0 && (() => {
        const sortedNums = [...selectedVerses].sort((a, b) => a - b)
        const anyHighlighted = sortedNums.some(vn => !!highlighted[`${book.id}-${chapter}-${vn}`])
        const allSameColor = (color: string) => sortedNums.every(vn => highlighted[`${book.id}-${chapter}-${vn}`]?.color === color)
        const anyBookmarked = sortedNums.some(vn => `${book.id}-${chapter}-${vn}` in bookmarked)
        return (
          <div
            className="fixed bottom-0 left-0 right-0 z-[200] animate-slide-up flex items-center gap-0.5 sm:gap-1.5 px-3 sm:px-4 overflow-x-auto"
            style={{
              paddingTop: "8px",
              paddingBottom: "max(8px, env(safe-area-inset-bottom))",
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(48px) saturate(1.8)",
              WebkitBackdropFilter: "blur(48px) saturate(1.8)",
              borderTop: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Reference */}
            <span className="text-[#c9a654] text-[11px] font-serif font-medium shrink-0 mr-1">
              {selectionRef()}
            </span>

            <div className="w-px h-4 bg-white/10 shrink-0 mx-1" />

            {/* Highlight swatches — slightly larger on mobile for touch */}
            {HL_COLORS.map(c => (
              <button key={c.id} onClick={() => applyHighlightColor(c.id)} title={c.id}
                className={cn("w-6 h-6 sm:w-5 sm:h-5 rounded-full shrink-0 transition-all duration-150 active:scale-95",
                  allSameColor(c.id) && "ring-2 ring-white/50 scale-110")}
                style={{ background: c.style }} />
            ))}
            {anyHighlighted && (
              <button onClick={removeHighlightSelection} title="Remover grifo"
                className="text-[#55524a] hover:text-[#c96b5a] transition-colors shrink-0 px-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="w-px h-4 bg-white/10 shrink-0 mx-1" />

            {/* Actions — text hidden on mobile, visible on sm+ */}
            <button
              onClick={() => { sortedNums.forEach(vn => toggleBookmark(`${book.id}-${chapter}-${vn}`, vn)); setSelectedVerses(new Set()) }}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-[11px] text-[#8a8375] hover:text-[#c9c0a8] hover:bg-white/5 transition-all shrink-0"
              title="Marcador"
            >
              <Bookmark className={cn("w-4 h-4 sm:w-3 sm:h-3 shrink-0", anyBookmarked && "text-[#c9a654] fill-[#c9a654]")} />
              <span className="hidden sm:inline">Marcador</span>
            </button>
            <button onClick={copyVerse}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-[11px] text-[#8a8375] hover:text-[#c9c0a8] hover:bg-white/5 transition-all shrink-0"
              title="Copiar">
              {copied ? <Check className="w-4 h-4 sm:w-3 sm:h-3 text-[#5a9e72]" /> : <Copy className="w-4 h-4 sm:w-3 sm:h-3" />}
              <span className="hidden sm:inline">{copied ? "Copiado!" : "Copiar"}</span>
            </button>
            <button onClick={() => { openNote(sortedNums[0]); setSelectedVerses(new Set()) }}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-[11px] text-[#8a8375] hover:text-[#c9c0a8] hover:bg-white/5 transition-all shrink-0"
              title="Nota rápida">
              <MessageSquare className={cn("w-4 h-4 sm:w-3 sm:h-3", verseNotes[`${book.id}-${chapter}-${sortedNums[0]}`] && "text-[#c9a654]")} />
              <span className="hidden sm:inline">Nota</span>
            </button>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button onClick={shareVerse}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-[11px] text-[#8a8375] hover:text-[#c9c0a8] hover:bg-white/5 transition-all shrink-0"
                title="Compartilhar">
                <Share2 className="w-4 h-4 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
            )}
            <button onClick={downloadVerseImage}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-[11px] text-[#8a8375] hover:text-[#c9c0a8] hover:bg-white/5 transition-all shrink-0"
              title="Baixar imagem">
              <span className="w-4 h-4 sm:w-3 sm:h-3 flex items-center justify-center text-[10px] sm:text-[9px]">⬇</span>
              <span className="hidden sm:inline">Imagem</span>
            </button>
            <button onClick={() => { fetchCompare(sortedNums[0]); setSelectedVerses(new Set()) }}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-[11px] text-[#8a8375] hover:text-[#c9c0a8] hover:bg-white/5 transition-all shrink-0"
              title="Comparar versões">
              <ArrowLeftRight className="w-4 h-4 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Comparar</span>
            </button>

            <div className="flex-1" />

            <button onClick={() => setSelectedVerses(new Set())} className="text-[#3d3a55] hover:text-[#55524a] transition-colors shrink-0 ml-1 p-1" title="Fechar">
              <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        )
      })()}

      {/* Inline verse note panel */}
      {noteVerse !== null && (() => {
        const bookName = BOOK_ID_NAMES[book.id] ?? book.name
        const noteKey  = `${book.id}-${chapter}-${noteVerse}`
        const existing = verseNotes[noteKey]
        return (
          <div
            className="fixed bottom-0 left-0 right-0 z-[200] animate-slide-up"
            style={{
              background: "rgba(14,13,25,0.96)",
              backdropFilter: "blur(48px) saturate(1.8)",
              WebkitBackdropFilter: "blur(48px) saturate(1.8)",
              borderTop: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}>
            <div className="max-w-2xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#c9a654] opacity-70" />
                  <span className="text-[#c9a654] text-[11px] font-serif">
                    {bookName} {chapter}:{noteVerse}
                  </span>
                </div>
                <button onClick={() => setNoteVerse(null)} className="text-[#3d3a55] hover:text-[#55524a] transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Escreva uma nota sobre este versículo..."
                autoFocus
                rows={3}
                className="w-full text-sm font-serif text-[#c9c0a8] placeholder:text-[#3d3a55] bg-transparent outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                {existing && (
                  <button
                    onClick={() => deleteNote(noteVerse)}
                    className="flex items-center gap-1.5 text-[#c96b5a] text-[11px] font-sans hover:opacity-80 transition-opacity mr-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    Excluir
                  </button>
                )}
                <button
                  onClick={() => setNoteVerse(null)}
                  className="text-[#55524a] text-[11px] font-sans hover:text-[#8a8375] transition-colors px-3 py-1.5"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveNote}
                  disabled={noteSaving}
                  className="bg-[#c9a65420] text-[#c9a654] border border-[#c9a65440] text-[11px] font-sans px-3 py-1.5 rounded-lg hover:bg-[#c9a65430] transition-all disabled:opacity-50"
                >
                  {noteSaving ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Chapter note panel */}
      {chapterNoteOpen && (() => {
        const bookName    = BOOK_ID_NAMES[book.id] ?? book.name
        const chapterKey  = `${book.id}-${chapter}-0`
        const existing    = verseNotes[chapterKey]
        return (
          <div
            className="fixed bottom-0 left-0 right-0 z-[200] animate-slide-up"
            style={{
              background: "rgba(14,13,25,0.96)",
              backdropFilter: "blur(48px) saturate(1.8)",
              WebkitBackdropFilter: "blur(48px) saturate(1.8)",
              borderTop: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="max-w-2xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PenLine className="w-3.5 h-3.5 text-[#c9a654] opacity-70" />
                  <span className="text-[#c9a654] text-[11px] font-serif">
                    {bookName} {chapter} — Notas do capítulo
                  </span>
                </div>
                <button onClick={() => setChapterNoteOpen(false)} className="text-[#3d3a55] hover:text-[#55524a] transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={chapterNoteText}
                onChange={e => setChapterNoteText(e.target.value)}
                placeholder="Pontos importantes, observações, reflexões sobre este capítulo..."
                autoFocus
                rows={4}
                className="w-full text-sm font-serif text-[#c9c0a8] placeholder:text-[#3d3a55] bg-transparent outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                {existing && (
                  <button
                    onClick={deleteChapterNote}
                    className="flex items-center gap-1.5 text-[#c96b5a] text-[11px] font-sans hover:opacity-80 transition-opacity mr-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    Excluir
                  </button>
                )}
                <button
                  onClick={() => setChapterNoteOpen(false)}
                  className="text-[#55524a] text-[11px] font-sans hover:text-[#8a8375] transition-colors px-3 py-1.5"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveChapterNote}
                  disabled={chapterNoteSaving}
                  className="bg-[#c9a65420] text-[#c9a654] border border-[#c9a65440] text-[11px] font-sans px-3 py-1.5 rounded-lg hover:bg-[#c9a65430] transition-all disabled:opacity-50"
                >
                  {chapterNoteSaving ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Version comparison panel */}
      {compareOpen && compareVerseNum !== null && (() => {
        const bookName = BOOK_ID_NAMES[book.id] ?? book.name
        return (
          <div
            className="fixed bottom-0 left-0 right-0 z-[200] animate-slide-up"
            style={{
              background: "rgba(14,13,25,0.97)",
              backdropFilter: "blur(48px) saturate(1.8)",
              WebkitBackdropFilter: "blur(48px) saturate(1.8)",
              borderTop: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}>
            <div className="max-w-2xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-[#c9a654] opacity-70" />
                  <span className="text-[#c9a654] text-[11px] font-serif">
                    {bookName} {chapter}:{compareVerseNum} — comparar versões
                  </span>
                </div>
                <button onClick={() => setCompareOpen(false)} className="text-[#3d3a55] hover:text-[#55524a] transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {compareLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-4 h-4 text-[#3d3a55] animate-spin" />
                </div>
              ) : (
                <div className="space-y-3 pb-1">
                  {VERSIONS.map(v => (
                    <div key={v.id} className="flex gap-3">
                      <span className={cn(
                        "text-[10px] font-medium tracking-wider shrink-0 mt-0.5 w-7",
                        version === v.id ? "text-[#c9a654]" : "text-[#3d3a55]"
                      )}>{v.label}</span>
                      <p className="font-serif text-[#8a8375] text-sm leading-relaxed flex-1">
                        {compareData[v.id] ?? "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Chapter picker modal */}
      {showChapterModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowChapterModal(false)} />
          <div className="relative z-10 w-full max-w-sm overflow-hidden flex flex-col modal-enter"
            style={{
              background: "rgba(14, 13, 25, 0.88)",
              backdropFilter: "blur(48px) saturate(1.6)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)",
              borderRadius: "24px",
              maxHeight: "calc(100vh - 120px)",
            }}>
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-display text-[9px] text-[#c9a654] uppercase tracking-[0.25em] opacity-70">Capítulo</p>
                <p className="font-serif text-[#c9c0a8] text-sm mt-0.5">{book.name}</p>
              </div>
              <button onClick={() => setShowChapterModal(false)} className="text-[#3d3a55] hover:text-[#8a8375] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 pb-5">
              <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${chapterCols}, minmax(0, 1fr))` }}>
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map(n => (
                  <button key={n}
                    onClick={() => {
                      setDirection(n > chapter ? "next" : "prev")
                      setAnimKey(k => k + 1)
                      setChapter(n)
                      setShowChapterModal(false)
                    }}
                    className={cn(
                      "py-2 text-xs font-serif rounded-xl transition-all duration-200",
                      n === chapter
                        ? "bg-[#c9a65420] text-[#c9a654]"
                        : "text-[#55524a] hover:text-[#c9c0a8] hover:bg-[#ffffff08]"
                    )}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book selector modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBookModal(false)} />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden flex flex-col modal-enter"
            style={{
              background: "rgba(14, 13, 25, 0.88)",
              backdropFilter: "blur(48px) saturate(1.6)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)",
              borderRadius: "24px",
              maxHeight: "calc(100vh - 96px)",
            }}>

            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex gap-2">
                {(["AT", "NT"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={cn(
                      "font-sans text-[10px] uppercase tracking-[0.2em] transition-all duration-200 px-3 py-1.5 rounded-full border",
                      tab === t
                        ? "bg-[#c9a65420] text-[#c9a654] border-[#c9a65440]"
                        : "text-[#3d3a55] border-[#ffffff08] hover:text-[#55524a]"
                    )}>
                    {t === "AT" ? "Antigo Testamento" : "Novo Testamento"}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowBookModal(false)} className="text-[#3d3a55] hover:text-[#8a8375] transition-colors duration-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3d3a55]" />
                <input
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  placeholder="Buscar livro..."
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl text-[#8a8375] placeholder:text-[#3d3a55] outline-none font-serif transition-colors duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onFocus={e => (e.target.style.borderColor = "rgba(201,166,84,0.4)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 pt-2">
              {filter.trim() ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                  {filteredBooks.map(b => {
                    const cat = getBookCategory(b.id)
                    return (
                      <button key={b.id}
                        onClick={() => { changeBook(b); setShowBookModal(false); setFilter("") }}
                        className={cn(
                          "px-3 py-2.5 text-left text-sm font-serif rounded-xl transition-all duration-200 border-l-2",
                          book.id === b.id ? "text-[#c9a654] bg-[#c9a65418]" : "text-[#55524a] hover:text-[#c9c0a8] hover:bg-[#ffffff06]"
                        )}
                        style={{ borderLeftColor: cat ? BOOK_CATEGORIES[cat.category].color : "transparent" }}>
                        {b.name}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-5">
                  {(tab === "AT" ? AT_GROUPS : NT_GROUPS).map(group => {
                    const groupBooks = group.ids.map(id => BOOK_MAP[id]).filter(Boolean)
                    const cat = BOOK_CATEGORIES[group.category]
                    return (
                      <div key={group.category}>
                        <div className="flex items-center gap-2 px-1 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                          <span className="font-display text-[8px] uppercase tracking-[0.28em]"
                            style={{ color: cat.color, opacity: 0.85 }}>
                            {cat.label}
                          </span>
                          <div className="flex-1 h-px" style={{ background: cat.color, opacity: 0.12 }} />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                          {groupBooks.map(b => (
                            <button key={b.id}
                              onClick={() => { changeBook(b); setShowBookModal(false); setFilter("") }}
                              className={cn(
                                "px-3 py-2.5 text-left text-sm font-serif rounded-xl transition-all duration-200 border-l-2",
                                book.id === b.id ? "text-[#c9c0a8] bg-[#ffffff08]" : "text-[#55524a] hover:text-[#c9c0a8] hover:bg-[#ffffff06]"
                              )}
                              style={{ borderLeftColor: book.id === b.id ? cat.color : "transparent" }}>
                              {b.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
