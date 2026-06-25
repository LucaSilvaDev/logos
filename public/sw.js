const SHELL_CACHE = "selah-shell-v1"
const BIBLE_CACHE = "selah-bible-v5"
const KNOWN_CACHES = [SHELL_CACHE, BIBLE_CACHE]

// App shell assets precached on install
const SHELL_ASSETS = [
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
]

// ─── Install: precache shell ──────────────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  )
})

// ─── Activate: clean old caches ──────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !KNOWN_CACHES.includes(k)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

// ─── Fetch strategy ──────────────────────────────────────────────────────────
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url)

  // Skip non-GET and cross-origin
  if (e.request.method !== "GET") return
  if (url.origin !== self.location.origin) return

  // Bible API: cache-first (text is immutable)
  if (url.pathname === "/api/biblia" && url.searchParams.has("book")) {
    e.respondWith(cacheFirst(e.request, BIBLE_CACHE))
    return
  }

  // Next.js static assets: cache-first, long-lived
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(cacheFirst(e.request, SHELL_CACHE))
    return
  }

  // Navigation: network-first, fallback to cache
  if (e.request.mode === "navigate") {
    e.respondWith(networkFirstNav(e.request))
    return
  }

  // Everything else: network with cache fallback
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const res = await fetch(request)
    if (res.ok) await cache.put(request, res.clone())
    return res
  } catch {
    return new Response(
      JSON.stringify({ error: "OFFLINE", verses: [] }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    )
  }
}

async function networkFirstNav(request) {
  try {
    const res = await fetch(request)
    if (res.ok) {
      const cache = await caches.open(SHELL_CACHE)
      await cache.put(request, res.clone())
    }
    return res
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    const offline = await caches.match("/offline")
    return offline ?? new Response("Offline — abra o Selah com conexão primeiro.", { status: 503 })
  }
}

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener("push", (e) => {
  let data = { title: "Selah", body: "Sua leitura diária está esperando.", url: "/plano" }
  try { data = e.data.json() } catch { /* ignore */ }

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [100, 50, 100],
      data: { url: data.url },
    })
  )
})

self.addEventListener("notificationclick", (e) => {
  e.notification.close()
  const url = e.notification.data?.url ?? "/"
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((c) => c.url.includes(self.location.origin))
      if (existing) {
        existing.navigate(url)
        return existing.focus()
      }
      return clients.openWindow(url)
    })
  )
})
