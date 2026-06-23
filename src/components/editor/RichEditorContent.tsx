"use client"

import { EditorContent } from "@tiptap/react"
import type { Editor } from "@tiptap/react"
import { useEditorSuggestion } from "@/hooks/useEditorSuggestion"
import { SuggestionDropdown } from "./SuggestionDropdown"

interface Props {
  editor: Editor | null
  className?: string
}

export function RichEditorContent({ editor, className }: Props) {
  const { suggestion, accept, dismiss } = useEditorSuggestion(editor)

  return (
    <>
      <EditorContent editor={editor} className={className} />
      {suggestion && (
        <SuggestionDropdown
          suggestion={suggestion}
          onAccept={accept}
          onDismiss={dismiss}
        />
      )}
    </>
  )
}
