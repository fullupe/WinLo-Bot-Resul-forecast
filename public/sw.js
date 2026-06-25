self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("rs-lotto-v1").then((cache) => cache.addAll(["/"])),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request)),
  );
});
