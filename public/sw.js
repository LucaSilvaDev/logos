const BIBLE_CACHE = "selah-bible-v1"

self.addEventListener("install", () => self.skipWaiting())

self.addEventListener("activate", (e) => {
  // Remove old cache versions on activation
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== BIBLE_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url)

  // Cache Bible chapter API responses (text never changes)
  if (url.pathname === "/api/biblia" && url.searchParams.has("book") && e.request.method === "GET") {
    e.respondWith(
      caches.open(BIBLE_CACHE).then(async (cache) => {
        const cached = await cache.match(e.request)
        if (cached) return cached
        try {
          const res = await fetch(e.request)
          if (res.ok) await cache.put(e.request, res.clone())
          return res
        } catch {
          return new Response(
            JSON.stringify({ error: "OFFLINE", verses: [] }),
            { status: 503, headers: { "Content-Type": "application/json" } }
          )
        }
      })
    )
    return
  }

  // All other requests pass through
  e.respondWith(fetch(e.request))
})
