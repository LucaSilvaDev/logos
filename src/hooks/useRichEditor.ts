"use client"

import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Highlight from "@tiptap/extension-highlight"
import TiptapLink from "@tiptap/extension-link"
import Typography from "@tiptap/extension-typography"

interface UseRichEditorOptions {
  placeholder: string
  /** Include the Link extension (devocional notes allow links; study notes don't). */
  link?: boolean
  /** Tailwind class for the editor's min-height + focus style. Must be a literal string for Tailwind to pick it up. */
  editorClassName?: string
}

export function useRichEditor({ placeholder, link = false, editorClassName = "tiptap min-h-[300px] focus:outline-none" }: UseRichEditorOptions) {
  return useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Highlight.configure({ multicolor: false }),
      ...(link ? [TiptapLink.configure({ openOnClick: false })] : []),
      Typography,
    ],
    editorProps: { attributes: { class: editorClassName } },
  })
}
