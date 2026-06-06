// Eenvoudige service worker: app offline beschikbaar maken op de iPad.
// Eigen cache-naam met eigen prefix zodat meerdere PWA's op hetzelfde domein
// (homepage + spellen) elkaars cache niet opruimen.
const CACHE = "olivia-poetsen-v1";
const CACHE_PREFIX = "olivia-poetsen-";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // Ruim alleen ONZE eigen oude caches op (zelfde prefix), niet die van de homepage
  // of andere spellen.
  e.waitUntil(
    caches.keys().then((sleutels) =>
      Promise.all(
        sleutels
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE)
          .map((k) => caches.delete(k))
      )
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
