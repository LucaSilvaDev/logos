import sanitizeHtml from "sanitize-html"

// Allowlist matches what TipTap StarterKit + extensions (Highlight, Link, Typography)
// emit. Anything outside this allowlist is stripped at the API boundary so a
// hand-crafted POST cannot inject <script>, on* handlers, or javascript: URLs.
const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "strong", "em", "u", "s", "code",
    "h1", "h2", "h3", "h4",
    "ul", "ol", "li",
    "blockquote", "mark",
    "a", "span",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    span: ["class"],
    mark: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }),
  },
  disallowedTagsMode: "discard",
}

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, RICH_TEXT_OPTIONS)
}

// Strips ALL HTML — used for fields that are displayed as plain text but
// may receive arbitrary input (bibleRef, tags, titles).
export function sanitizePlainText(input: string): string {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim()
}
