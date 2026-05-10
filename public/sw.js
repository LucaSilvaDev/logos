// Minimal service worker — enables PWA install on desktop Chrome
self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", () => self.clients.claim())
// Pass all requests through (no offline cache — keeps things simple)
self.addEventListener("fetch", (e) => e.respondWith(fetch(e.request)))
