// Permite instalar la web como app y abrirla aunque la señal sea débil.
// Siempre intenta traer la versión nueva; si no hay internet, usa la guardada.
const CACHE = "canchas-v1";
const FILES = ["./", "./index.html", "./admin.html", "./styles.css", "./common.js", "./config.js", "./logo.png", "./icon-192.png", "./icon-512.png", "./manifest.json"];

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // las reservas siempre van en vivo a Supabase
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
