"use client"

import { X, Trash2, MessageSquare, PenLine } from "lucide-react"
import { BOOK_ID_NAMES } from "@/lib/reading-plan"
import type { BiblePageState } from "@/hooks/useBiblePage"

const PANEL_STYLE = {
  background: "rgba(14,14,16,0.96)",
  backdropFilter: "blur(48px) saturate(1.8)",
  WebkitBackdropFilter: "blur(48px) saturate(1.8)",
  borderTop: "1px solid rgba(255,255,255,0.09)",
  boxShadow: "0 -8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
} as const

// ── Verse note ────────────────────────────────────────────────────────────────

type VerseNoteProps = Pick<BiblePageState,
  "book" | "chapter" | "noteVerse" | "noteText" | "noteSaving" | "verseNotes" |
  "setNoteVerse" | "setNoteText" | "saveNote" | "deleteNote"
>

export function BibleVerseNotePanel({
  book, chapter, noteVerse, noteText, noteSaving, verseNotes,
  setNoteVerse, setNoteText, saveNote, deleteNote,
}: VerseNoteProps) {
  if (noteVerse === null) return null
  const bookName = BOOK_ID_NAMES[book.id] ?? book.name
  const existing = verseNotes[`${book.id}-${chapter}-${noteVerse}`]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] animate-slide-up" style={PANEL_STYLE}>
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-[#c9a654] opacity-70" />
            <span className="text-[#c9a654] text-[11px] font-serif">{bookName} {chapter}:{noteVerse}</span>
          </div>
          <button onClick={() => setNoteVerse(null)} className="text-[#3d3a55] hover:text-[#55524a] transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={noteText} onChange={e => setNoteText(e.target.value)}
          placeholder="Escreva uma nota sobre este versículo..."
          autoFocus rows={3}
          className="w-full text-sm font-serif text-[#c9c0a8] placeholder:text-[#3d3a55] bg-transparent outline-none resize-none leading-relaxed"
        />
        <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/5">
          {existing && (
            <button onClick={() => deleteNote(noteVerse)}
              className="flex items-center gap-1.5 text-[#c96b5a] text-[11px] font-sans hover:opacity-80 transition-opacity mr-auto">
              <Trash2 className="w-3 h-3" /> Excluir
            </button>
          )}
          <button onClick={() => setNoteVerse(null)} className="text-[#55524a] text-[11px] font-sans hover:text-[#8a8375] transition-colors px-3 py-1.5">
            Cancelar
          </button>
          <button onClick={saveNote} disabled={noteSaving}
            className="bg-[#c9a65420] text-[#c9a654] border border-[#c9a65440] text-[11px] font-sans px-3 py-1.5 rounded-lg hover:bg-[#c9a65430] transition-all disabled:opacity-50">
            {noteSaving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Chapter note ──────────────────────────────────────────────────────────────

type ChapterNoteProps = Pick<BiblePageState,
  "book" | "chapter" | "chapterNoteOpen" | "chapterNoteText" | "chapterNoteSaving" | "verseNotes" |
  "setChapterNoteOpen" | "setChapterNoteText" | "saveChapterNote" | "deleteChapterNote"
>

export function BibleChapterNotePanel({
  book, chapter, chapterNoteOpen, chapterNoteText, chapterNoteSaving, verseNotes,
  setChapterNoteOpen, setChapterNoteText, saveChapterNote, deleteChapterNote,
}: ChapterNoteProps) {
  if (!chapterNoteOpen) return null
  const bookName = BOOK_ID_NAMES[book.id] ?? book.name
  const existing = verseNotes[`${book.id}-${chapter}-0`]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] animate-slide-up" style={PANEL_STYLE}>
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PenLine className="w-3.5 h-3.5 text-[#c9a654] opacity-70" />
            <span className="text-[#c9a654] text-[11px] font-serif">{bookName} {chapter} — Notas do capítulo</span>
          </div>
          <button onClick={() => setChapterNoteOpen(false)} className="text-[#3d3a55] hover:text-[#55524a] transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={chapterNoteText} onChange={e => setChapterNoteText(e.target.value)}
          placeholder="Pontos importantes, observações, reflexões sobre este capítulo..."
          autoFocus rows={4}
          className="w-full text-sm font-serif text-[#c9c0a8] placeholder:text-[#3d3a55] bg-transparent outline-none resize-none leading-relaxed"
        />
        <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/5">
          {existing && (
            <button onClick={deleteChapterNote}
              className="flex items-center gap-1.5 text-[#c96b5a] text-[11px] font-sans hover:opacity-80 transition-opacity mr-auto">
              <Trash2 className="w-3 h-3" /> Excluir
            </button>
          )}
          <button onClick={() => setChapterNoteOpen(false)} className="text-[#55524a] text-[11px] font-sans hover:text-[#8a8375] transition-colors px-3 py-1.5">
            Cancelar
          </button>
          <button onClick={saveChapterNote} disabled={chapterNoteSaving}
            className="bg-[#c9a65420] text-[#c9a654] border border-[#c9a65440] text-[11px] font-sans px-3 py-1.5 rounded-lg hover:bg-[#c9a65430] transition-all disabled:opacity-50">
            {chapterNoteSaving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  )
}
