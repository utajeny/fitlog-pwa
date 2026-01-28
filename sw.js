const CACHE_VERSION = "v1.0.3"; // 🔥 zvýš pri každom deploy
const CACHE_NAME = `fitlog-${CACHE_VERSION}`;

// Daj sem len statické súbory (UI), nie exercises.json
const STATIC_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_FILES)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ✅ Network-first pre všetko, ale zvlášť: exercises.json vždy live
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 🔥 ALWAYS LIVE: exercises.json
  if (url.pathname.endsWith("/exercises.json")) {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
    return;
  }

  // ostatné súbory: network-first + fallback cache
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

