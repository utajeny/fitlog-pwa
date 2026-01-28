const CACHE_VERSION = "v2026-01-28"; // ⬅️ zmeň pri každom deployi
const CACHE_NAME = `fitlog-${CACHE_VERSION}`;

const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./exercises.json",
  "./sw.js"
];

// Install – cache new version
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

// Activate – delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch – network first (always try fresh)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
