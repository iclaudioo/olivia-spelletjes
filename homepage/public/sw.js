// Eenvoudige service worker voor Olivia's homepage: app offline beschikbaar maken.
// Eigen cache-naam met eigen prefix (los van de spellen) zodat PWA's op hetzelfde
// domein elkaars cache niet overschrijven of opruimen.
const CACHE = "olivia-home-v1";
const CACHE_PREFIX = "olivia-home-";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // Ruim alleen ONZE eigen oude caches op (zelfde prefix). Caches van een spel
  // (bv. olivia-poetsen-*) laten we met rust — die beheert het spel zelf.
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
  // Laat verzoeken voor een spel met rust: elk spel (bv. /spelletjes/poetsen/) heeft
  // zijn eigen service worker + cache. Zo cachet de homepage-SW de spel-caches niet,
  // ook niet offline.
  if (new URL(e.request.url).pathname.startsWith("/spelletjes/")) return;
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
