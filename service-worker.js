self.addEventListener("install", e => {
    e.waitUntil(
        caches.open("credicompany").then(cache => {
            return cache.addAll(["./"]);
        })
    );
});