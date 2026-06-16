"use client"

import { useEffect, useState } from "react"

/** Loads a resource by URL on mount, exposing loading/error state instead of failing silently. */
export function useResourceLoader<T>(url: string | null, onLoad: (data: T) => void) {
  const [state, setState] = useState<{ url: string | null; loading: boolean; error: string | null }>(
    () => ({ url, loading: Boolean(url), error: null })
  )

  useEffect(() => {
    if (!url) return
    let cancelled = false
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`Erro ao carregar (${r.status})`)
        return r.json()
      })
      .then((d: T) => {
        if (cancelled) return
        onLoad(d)
        setState({ url, loading: false, error: null })
      })
      .catch((e: Error) => {
        if (cancelled) return
        setState({ url, loading: false, error: e.message })
      })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  // While the effect for the current `url` hasn't resolved yet, report loading instead of stale state.
  const stale = state.url !== url
  return { loading: stale ? Boolean(url) : state.loading, loadError: stale ? null : state.error }
}

/** Sends a JSON request and throws (instead of failing silently) when the response isn't ok. */
export async function submitJson(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Erro ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json().catch(() => null)
}
