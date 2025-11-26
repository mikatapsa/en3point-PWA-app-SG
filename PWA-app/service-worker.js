// DEVELOPMENT MODE SERVICE WORKER
// No caching, always fetch from network

self.addEventListener("install", event => {
  // Activate immediately without waiting
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  // Take control of pages immediately
  event.waitUntil(self.clients.claim());
});

// Always fetch from network in dev mode
self.addEventListener("fetch", event => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Optional fallback: root index
        return fetch("/index.html");
      })
  );
});
