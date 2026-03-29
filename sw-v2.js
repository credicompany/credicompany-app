self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => self.clients.claim());

// SIN CACHE (evita errores)
self.addEventListener("fetch", () => {});
