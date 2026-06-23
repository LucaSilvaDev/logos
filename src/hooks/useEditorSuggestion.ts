"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import type { Editor } from "@tiptap/react"

export interface SuggestionState {
  type: "verse" | "note"
  query: string
  from: number   // doc position of the trigger char
  to:   number   // current cursor position
  coords: { top: number; left: number; bottom: number }
}

export function useEditorSuggestion(editor: Editor | null) {
  const [suggestion, setSuggestion] = useState<SuggestionState | null>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const detect = useCallback(() => {
    if (!editor || !editor.isEditable) { setSuggestion(null); return }

    const { from } = editor.state.selection
    // Look at the last 60 chars before cursor
    const start = Math.max(0, from - 60)
    const text  = editor.state.doc.textBetween(start, from)

    // @trigger — must not have a space after @
    const verseMatch = text.match(/@([\wÀ-ú]*)$/)
    if (verseMatch) {
      const triggerPos = from - verseMatch[0].length
      const coords = editor.view.coordsAtPos(triggerPos)
      setSuggestion({ type: "verse", query: verseMatch[1], from: triggerPos, to: from, coords })
      return
    }

    // [[trigger
    const noteMatch = text.match(/\[\[([\wÀ-ú\s]*)$/)
    if (noteMatch) {
      const triggerPos = from - noteMatch[0].length
      const coords = editor.view.coordsAtPos(triggerPos)
      setSuggestion({ type: "note", query: noteMatch[1].trim(), from: triggerPos, to: from, coords })
      return
    }

    setSuggestion(null)
  }, [editor])

  useEffect(() => {
    if (!editor) return

    function onChange() {
      if (debounce.current) clearTimeout(debounce.current)
      debounce.current = setTimeout(detect, 80)
    }

    editor.on("update", onChange)
    editor.on("selectionUpdate", onChange)
    return () => {
      editor.off("update", onChange)
      editor.off("selectionUpdate", onChange)
      if (debounce.current) clearTimeout(debounce.current)
    }
  }, [editor, detect])

  const accept = useCallback((insertText: string) => {
    if (!editor || !suggestion) return
    editor
      .chain()
      .focus()
      .deleteRange({ from: suggestion.from, to: suggestion.to })
      .insertContent(insertText)
      .run()
    setSuggestion(null)
  }, [editor, suggestion])

  const dismiss = useCallback(() => setSuggestion(null), [])

  return { suggestion, accept, dismiss }
}
