import { describe, it, expect } from "vitest"
import { safeAppPath } from "./safe-next"

describe("safeAppPath", () => {
  it("passes through a normal in-app path", () => {
    expect(safeAppPath("/dashboard")).toBe("/dashboard")
  })

  it("preserves the query string", () => {
    expect(safeAppPath("/biblia?book=GEN&chapter=1")).toBe("/biblia?book=GEN&chapter=1")
  })

  it("falls back for null/undefined/empty input", () => {
    expect(safeAppPath(null)).toBe("/biblia")
    expect(safeAppPath(undefined)).toBe("/biblia")
    expect(safeAppPath("")).toBe("/biblia")
  })

  it("strips the host from a protocol-relative open-redirect attempt", () => {
    const result = safeAppPath("//evil.com/phish")
    expect(result.startsWith("//")).toBe(false)
    expect(result).not.toContain("evil.com")
  })

  it("strips the host from an absolute external URL", () => {
    const result = safeAppPath("https://evil.com/phish")
    expect(result).not.toContain("evil.com")
  })

  it("rejects javascript: URLs", () => {
    expect(safeAppPath("javascript:alert(1)")).toBe("/biblia")
  })

  it("refuses to redirect back into auth pages", () => {
    expect(safeAppPath("/entrar")).toBe("/biblia")
    expect(safeAppPath("/cadastro?x=1")).toBe("/biblia")
    expect(safeAppPath("/redefinir-senha/abc")).toBe("/biblia")
  })

  it("rejects embedded credentials", () => {
    expect(safeAppPath("https://user:pass@evil.com/x")).toBe("/biblia")
  })
})
