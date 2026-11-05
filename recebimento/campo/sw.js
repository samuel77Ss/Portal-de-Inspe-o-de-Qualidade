/* Guarda a estrutura do app para abrir mesmo sem sinal. Os dados seguem pelo banco. */
const CACHE = "amr-campo-v5";
const ARQS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "../assets/base.css", "../assets/vendor/html5-qrcode.min.js", "../assets/vendor/xlsx.mini.min.js", "../assets/vendor/msal-browser.min.js", "../assets/diligenciamento.js", "../assets/exemplo-docs.js", "../assets/dados.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
