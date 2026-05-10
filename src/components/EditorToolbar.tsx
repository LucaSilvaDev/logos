"use client"

import type { Editor } from "@tiptap/core"
import { Bold, Italic, Quote, List, ListOrdered, Highlighter } from "lucide-react"
import { cn } from "@/lib/utils"

const ACTIONS = [
  { key: "bold",        icon: Bold,         run: (e: Editor) => e.chain().focus().toggleBold().run() },
  { key: "italic",      icon: Italic,        run: (e: Editor) => e.chain().focus().toggleItalic().run() },
  { key: "blockquote",  icon: Quote,         run: (e: Editor) => e.chain().focus().toggleBlockquote().run() },
  { key: "bulletList",  icon: List,          run: (e: Editor) => e.chain().focus().toggleBulletList().run() },
  { key: "orderedList", icon: ListOrdered,   run: (e: Editor) => e.chain().focus().toggleOrderedList().run() },
  { key: "highlight",   icon: Highlighter,   run: (e: Editor) => e.chain().focus().toggleHighlight().run() },
] as const

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  return (
    <div className="flex items-center gap-0.5 px-3 py-2 border-b border-[#2e2b42] flex-wrap">
      {ACTIONS.map(({ key, icon: Icon, run }) => (
        <button key={key} type="button" onClick={() => run(editor)}
          className={cn("p-1.5 rounded-lg transition-colors",
            editor.isActive(key)
              ? "bg-[#c9a65420] text-[#c9a654]"
              : "text-[#3d3a55] hover:text-[#8a8375] hover:bg-[#1a1928]"
          )}>
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  )
}
