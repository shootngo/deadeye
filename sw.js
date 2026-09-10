/* Deadeye service worker — cache name unique vs Nickey / Stashr / Buck and Bacon / Nestor */
const CACHE = "deadeye-v2";
const SHELL = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/hints.js",
  "./js/db.js",
  "./js/app.js",
  "./js/regs-ms-north.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon.png",
  "./favicon-48.png",
  "./splash.png",
  "./splash.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      for (const url of SHELL) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn("[Deadeye SW] skip", url, err);
        }
      }
      self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isHTML =
    req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith(".html");

  event.respondWith(
    (async () => {
      if (isHTML) {
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) {
            const cache = await caches.open(CACHE);
            cache.put(req, fresh.clone());
          }
          return fresh;
        } catch (err) {
          return (
            (await caches.match(req, { ignoreSearch: true })) ||
            (await caches.match("./index.html")) ||
            Promise.reject(err)
          );
        }
      }

      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok && req.url.startsWith(self.location.origin)) {
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (err) {
        throw err;
      }
    })(),
  );
});
