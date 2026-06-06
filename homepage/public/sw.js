// Eenvoudige service worker voor Olivia's homepage: app offline beschikbaar maken.
// Eigen cache-naam (los van de spellen) zodat PWA's op hetzelfde domein elkaars
// cache niet overschrijven.
const CACHE = "olivia-home-v1";

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
