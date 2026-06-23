"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { BOOKS, BOOK_ID_NAMES } from "@/lib/reading-plan"
import {
  VERSIONS, HL_COLORS, readSavedPos, readSavedFont,
  generateVerseImage,
  type Verse, type HlEntry, type BibleVersion, type FontSize, type ApiError,
} from "@/lib/bible-reader"

export function useBiblePage() {
  const pos0 = readSavedPos()

  const [book,    setBook]    = useState(() => pos0?.book    ?? BOOKS[0])
  const [chapter, setChapter] = useState(() => pos0?.chapter ?? 1)
  const [version, setVersion] = useState<BibleVersion>(() => pos0?.version ?? "nvi")
  const [fontSize, setFontSize] = useState<FontSize>(readSavedFont)

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
  const [apiError,  setApiError]  = useState<ApiError>(null)
  const [apiDetail, setApiDetail] = useState("")
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [animKey,   setAnimKey]   = useState(0)
  const [showBookModal,    setShowBookModal]    = useState(false)
  const [showChapterModal, setShowChapterModal] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState(false)

  const [compareOpen,     setCompareOpen]     = useState(false)
  const [compareVerseNum, setCompareVerseNum] = useState<number | null>(null)
  const [compareData,     setCompareData]     = useState<Record<string, string>>({})
  const [compareLoading,  setCompareLoading]  = useState(false)

  const [scrollProgress, setScrollProgress] = useState(0)
  const [readChapters,   setReadChapters]   = useState<Set<string>>(new Set())
  const [readSaving,     setReadSaving]     = useState(false)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  // ── Side effects ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (selectedVerses.size > 0) document.body.classList.add("verse-bar-open")
    else document.body.classList.remove("verse-bar-open")
    return () => document.body.classList.remove("verse-bar-open")
  }, [selectedVerses.size])

  useEffect(() => {
    const el = document.querySelector("main") as HTMLElement | null
    if (!el) return
    function onScroll() {
      const { scrollTop, scrollHeight, clientHeight } = el!
      setScrollProgress(scrollHeight <= clientHeight ? 0 : scrollTop / (scrollHeight - clientHeight))
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return
      if (compareOpen)             { setCompareOpen(false);       return }
      if (chapterNoteOpen)         { setChapterNoteOpen(false);   return }
      if (noteVerse !== null)      { setNoteVerse(null);          return }
      if (selectedVerses.size > 0) { setSelectedVerses(new Set()); return }
      if (showChapterModal)        { setShowChapterModal(false);  return }
      if (showBookModal)           { setShowBookModal(false);     return }
      if (focusMode)                 setFocusMode(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [focusMode, chapterNoteOpen, noteVerse, selectedVerses, showChapterModal, showBookModal, compareOpen])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if ((e.target as HTMLElement)?.isContentEditable) return
      if (showBookModal || showChapterModal || noteVerse !== null || chapterNoteOpen || compareOpen) return
      if (e.key === "j") goChapter(1)
      if (e.key === "k") goChapter(-1)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBookModal, showChapterModal, noteVerse, chapterNoteOpen, compareOpen, book, chapter])

  useEffect(() => {
    try {
      localStorage.setItem("selah-bible-pos", JSON.stringify({ bookId: book.id, chapter, version }))
      window.dispatchEvent(new CustomEvent("selah-bible-pos"))
    } catch { /* ignore */ }
    const t = setTimeout(() => {
      fetch("/api/biblia/last-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, chapter, version }),
      }).catch(() => {})
    }, 1500)
    return () => clearTimeout(t)
  }, [book, chapter, version])

  useEffect(() => {
    try { localStorage.setItem("selah-bible-font", fontSize) } catch { /* ignore */ }
  }, [fontSize])

  useEffect(() => {
    let active = true
    fetch(`/api/biblia/highlights?book=${book.id}&chapter=${chapter}&version=${version}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: { id: string; verseStart: number; verseEnd: number; color: string }[]) => {
        if (!active) return
        const map: Record<string, HlEntry> = {}
        for (const h of data)
          for (let v = h.verseStart; v <= h.verseEnd; v++)
            map[`${book.id}-${chapter}-${v}`] = { id: h.id, color: h.color }
        setHighlighted(map)
      })
      .catch(() => {})
    return () => { active = false }
  }, [book, chapter, version])

  useEffect(() => {
    let active = true
    fetch(`/api/biblia/bookmarks?book=${book.id}&chapter=${chapter}&version=${version}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: { id: string; verse: number | null }[]) => {
        if (!active) return
        const map: Record<string, string> = {}
        for (const b of data) if (b.verse != null) map[`${book.id}-${chapter}-${b.verse}`] = b.id
        setBookmarked(map)
      })
      .catch(() => {})
    return () => { active = false }
  }, [book, chapter, version])

  useEffect(() => {
    let active = true
    setVerseNotes({}); setChapterNoteOpen(false)
    fetch(`/api/biblia/notes?book=${book.id}&chapter=${chapter}&version=${version}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: { id: string; verse: number; text: string }[]) => {
        if (!active) return
        const map: Record<string, { id: string; text: string }> = {}
        for (const n of data) map[`${book.id}-${chapter}-${n.verse}`] = { id: n.id, text: n.text }
        setVerseNotes(map)
      })
      .catch(() => {})
    return () => { active = false }
  }, [book, chapter, version])

  useEffect(() => {
    let active = true
    fetch(`/api/biblia/read?book=${book.id}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: { book: string; chapter: number }[]) => {
        if (!active) return
        setReadChapters(new Set(data.map(r => `${r.book}-${r.chapter}`)))
      })
      .catch(() => {})
    return () => { active = false }
  }, [book.id])

  // ── Handlers ────────────────────────────────────────────────────────────────

  function haptic(duration = 10) {
    try { navigator.vibrate?.(duration) } catch { /* ignore */ }
  }

  async function toggleRead() {
    const key = `${book.id}-${chapter}`
    const isRead = readChapters.has(key)
    haptic(isRead ? 10 : 30)
    setReadSaving(true)
    setReadChapters(prev => { const n = new Set(prev); isRead ? n.delete(key) : n.add(key); return n })
    try {
      await fetch("/api/biblia/read", {
        method: isRead ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book: book.id, chapter }),
      })
    } catch {
      setReadChapters(prev => { const n = new Set(prev); isRead ? n.add(key) : n.delete(key); return n })
    } finally { setReadSaving(false) }
  }

  const fetchVerses = useCallback(async () => {
    setLoading(true); setApiError(null); setVerses([])
    try {
      const res  = await fetch(`/api/biblia?book=${book.id}&chapter=${chapter}&version=${version}`)
      const data = await res.json()
      if (data.error === "AUTH_REQUIRED") { setApiError("AUTH_REQUIRED"); return }
      if (data.error === "RATE_LIMIT")    { setApiError("RATE_LIMIT");    return }
      if (!res.ok || data.error)          { setApiDetail(data.detail ?? data.error ?? `HTTP ${res.status}`); setApiError("ERROR"); return }
      setVerses((data.verses ?? []).map((v: Verse) => ({ number: v.number, text: v.text, endNumber: v.endNumber, heading: v.heading })))
    } catch { setApiError("ERROR") }
    finally  { setLoading(false) }
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
    setDirection(delta > 0 ? "next" : "prev"); setAnimKey(k => k + 1); setChapter(next)
  }

  function changeBook(b: typeof BOOKS[0]) {
    setBook(b); setChapter(1); setDirection("next"); setAnimKey(k => k + 1)
  }

  function openNote(verseNumber: number) {
    const key = `${book.id}-${chapter}-${verseNumber}`
    setNoteText(verseNotes[key]?.text ?? ""); setNoteVerse(verseNumber)
  }

  async function saveNote() {
    if (noteVerse === null) return
    setNoteSaving(true)
    const key = `${book.id}-${chapter}-${noteVerse}`
    try {
      if (!noteText.trim()) {
        const existing = verseNotes[key]
        if (existing) {
          await fetch("/api/biblia/notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: existing.id }) })
          setVerseNotes(prev => { const n = { ...prev }; delete n[key]; return n })
        }
      } else {
        const res  = await fetch("/api/biblia/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ book: book.id, chapter, verse: noteVerse, version, text: noteText }) })
        const data = await res.json()
        if (data?.id) setVerseNotes(prev => ({ ...prev, [key]: { id: data.id, text: noteText } }))
      }
      setNoteVerse(null)
    } finally { setNoteSaving(false) }
  }

  async function deleteNote(verseNumber: number) {
    const key = `${book.id}-${chapter}-${verseNumber}`
    const existing = verseNotes[key]
    if (!existing) return
    await fetch("/api/biblia/notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: existing.id }) })
    setVerseNotes(prev => { const n = { ...prev }; delete n[key]; return n })
    setNoteVerse(null)
  }

  function openChapterNote() {
    setNoteVerse(null)
    setChapterNoteText(verseNotes[`${book.id}-${chapter}-0`]?.text ?? "")
    setChapterNoteOpen(true)
  }

  async function saveChapterNote() {
    setChapterNoteSaving(true)
    const key = `${book.id}-${chapter}-0`
    try {
      if (!chapterNoteText.trim()) {
        const existing = verseNotes[key]
        if (existing) {
          await fetch("/api/biblia/notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: existing.id }) })
          setVerseNotes(prev => { const n = { ...prev }; delete n[key]; return n })
        }
      } else {
        const res  = await fetch("/api/biblia/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ book: book.id, chapter, verse: 0, version, text: chapterNoteText }) })
        const data = await res.json()
        if (data?.id) setVerseNotes(prev => ({ ...prev, [key]: { id: data.id, text: chapterNoteText } }))
      }
      setChapterNoteOpen(false)
    } finally { setChapterNoteSaving(false) }
  }

  async function deleteChapterNote() {
    const key = `${book.id}-${chapter}-0`
    const existing = verseNotes[key]
    if (!existing) return
    await fetch("/api/biblia/notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: existing.id }) })
    setVerseNotes(prev => { const n = { ...prev }; delete n[key]; return n })
    setChapterNoteText(""); setChapterNoteOpen(false)
  }

  function selectionRef() {
    const bookName = BOOK_ID_NAMES[book.id] ?? book.name
    const nums = [...selectedVerses].sort((a, b) => a - b)
    if (!nums.length) return ""
    if (nums.length === 1) return `${bookName} ${chapter}:${nums[0]}`
    const contiguous = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1)
    if (contiguous) return `${bookName} ${chapter}:${nums[0]}–${nums[nums.length - 1]}`
    return `${bookName} ${chapter}:${nums.join(", ")}`
  }

  function selectionText() {
    return verses.filter(v => selectedVerses.has(v.number)).sort((a, b) => a.number - b.number).map(v => `${v.number} ${v.text}`).join(" ")
  }

  async function copyVerse() {
    if (!selectedVerses.size) return
    await navigator.clipboard.writeText(`${selectionText()}\n— ${selectionRef()}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  async function shareVerse() {
    if (!selectedVerses.size) return
    const text = verses.filter(v => selectedVerses.has(v.number)).sort((a, b) => a.number - b.number).map(v => v.text).join(" ")
    const ref  = selectionRef()
    if (navigator.share && navigator.canShare) {
      try {
        const dataUrl = generateVerseImage(text, ref)
        const blob = await fetch(dataUrl).then(r => r.blob())
        const file = new File([blob], `${ref.replace(/\s/g, "_")}.png`, { type: "image/png" })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: ref })
          setSelectedVerses(new Set()); return
        }
      } catch { /* fall through */ }
    }
    if (navigator.share) await navigator.share({ text: `${text}\n\n— ${ref}\n\nSelah` }).catch(() => {})
    setSelectedVerses(new Set())
  }

  function downloadVerseImage() {
    if (!selectedVerses.size) return
    const text = verses.filter(v => selectedVerses.has(v.number)).sort((a, b) => a.number - b.number).map(v => v.text).join(" ")
    const dataUrl = generateVerseImage(text, selectionRef())
    const a = document.createElement("a")
    a.href = dataUrl; a.download = `${selectionRef().replace(/\s/g, "_")}.png`; a.click()
    setSelectedVerses(new Set())
  }

  async function fetchCompare(verseNum: number) {
    setCompareOpen(true); setCompareVerseNum(verseNum); setCompareLoading(true); setCompareData({})
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
    } finally { setCompareLoading(false) }
  }

  function handleVerseClick(e: React.MouseEvent, verseNumber: number) {
    e.stopPropagation()
    setSelectedVerses(prev => { const n = new Set(prev); n.has(verseNumber) ? n.delete(verseNumber) : n.add(verseNumber); return n })
  }

  async function applyHighlightColor(color: string) {
    const sortedNums = [...selectedVerses].sort((a, b) => a - b)
    if (!sortedNums.length) return
    const snapshot: Record<number, HlEntry | undefined> = {}
    for (const vn of sortedNums) snapshot[vn] = highlighted[`${book.id}-${chapter}-${vn}`]
    const allSameColor = sortedNums.every(vn => snapshot[vn]?.color === color)
    setHighlighted(prev => {
      const n = { ...prev }
      for (const vn of sortedNums) {
        const k = `${book.id}-${chapter}-${vn}`
        if (allSameColor) delete n[k]; else n[k] = { id: snapshot[vn]?.id ?? "pending", color }
      }
      return n
    })
    setSelectedVerses(new Set())
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
    for (const { entry } of toDelete)
      fetch("/api/biblia/highlights", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: entry!.id }) }).catch(() => {})
  }

  async function toggleBookmark(key: string, verseNumber: number) {
    const existingId = bookmarked[key]
    if (existingId) {
      setBookmarked(prev => { const n = { ...prev }; delete n[key]; return n })
      fetch("/api/biblia/bookmarks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: existingId }) }).catch(() => {})
    } else {
      setBookmarked(prev => ({ ...prev, [key]: "pending" }))
      const res  = await fetch("/api/biblia/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ book: book.id, chapter, verse: verseNumber, version }) }).catch(() => null)
      const data = res ? await res.json().catch(() => null) : null
      if (data?.id) setBookmarked(prev => ({ ...prev, [key]: data.id }))
    }
  }

  return {
    // state
    book, chapter, version, fontSize, tab, filter,
    highlighted, bookmarked, verseNotes,
    noteVerse, noteText, noteSaving,
    chapterNoteOpen, chapterNoteText, chapterNoteSaving,
    verses, loading, apiError, apiDetail, direction, animKey,
    showBookModal, showChapterModal, focusMode,
    selectedVerses, copied,
    compareOpen, compareVerseNum, compareData, compareLoading,
    scrollProgress, readChapters, readSaving,
    touchStartX, touchStartY,
    // setters
    setBook, setChapter, setVersion, setFontSize,
    setTab, setFilter,
    setNoteText, setNoteVerse,
    setChapterNoteOpen, setChapterNoteText,
    setShowBookModal, setShowChapterModal,
    setFocusMode, setSelectedVerses,
    setCompareOpen, setDirection, setAnimKey,
    // handlers
    goChapter, changeBook,
    openNote, saveNote, deleteNote,
    openChapterNote, saveChapterNote, deleteChapterNote,
    selectionRef, copyVerse, shareVerse, downloadVerseImage,
    fetchCompare, handleVerseClick,
    applyHighlightColor, removeHighlightSelection,
    toggleBookmark, toggleRead, fetchVerses,
    // derived
    isFirstInBible: book.id === "GEN" && chapter === 1,
    isLastInBible:  book.id === "REV" && chapter === book.chapters,
    filteredBooks: BOOKS.filter(b => b.testament === tab && b.name.toLowerCase().includes(filter.toLowerCase())),
    chapterCols: (() => { const c = book.chapters; return c <= 9 ? 3 : c <= 30 ? 5 : c <= 60 ? 6 : 8 })(),
  }
}

export type BiblePageState = ReturnType<typeof useBiblePage>
