// Eenvoudige service worker: app offline beschikbaar maken op de iPad.
const CACHE = "schoonmaak-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((sleutels) =>
      Promise.all(sleutels.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first met cache-fallback: altijd verse versie als er internet is,
// anders de opgeslagen versie.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const kopie = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, kopie)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
