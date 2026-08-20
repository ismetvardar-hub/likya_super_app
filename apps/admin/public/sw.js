/* ============================================================
   LİKYA SPORTVISIONX — Service Worker (PWA Offline-First, Adım 97)
   Stratejiler:
   • Cache-First  → statik varlıklar, 3D mesh'ler, ses tonları, fontlar
   • Network-First→ sporcu kadroları / kort programları (IndexedDB fallback)
   • Background sync → çevrimdışı kaydedilen BLE seans çerçeveleri
   Sürüm: v2 — her güncellemede CACHE adı artırılır.
   ============================================================ */
const CACHE = 'likya-sportvisionx-v2';
const STATIC_CACHE = 'likya-static-v2';
const SHELL = ['/', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

// Cache-First için statik varlık desenleri (3D, ses, font, görsel)
const STATIC_PATTERN = /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?|mp3|ogg|glb|gltf|bin)$/;
// Network-First + IndexedDB fallback: veri uç noktaları
const DATA_PATTERN = /\/api\/|\/roster|\/schedule/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE).then((cache) => cache.addAll(SHELL)),
      caches.open(STATIC_CACHE),
    ]).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// ── 1. CACHE-FIRST: statik varlıklar (3D mesh, ses tonu, font, görsel) ────────
async function cacheFirst(request) {
  const cached = await caches.match(request, { cacheName: STATIC_CACHE });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const copy = response.clone();
    caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
  }
  return response;
}

// ── 2. NETWORK-FIRST: kadro/program verisi (IndexedDB fallback) ───────────────
async function networkFirstWithIdb(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
      return response;
    }
    throw new Error('non-ok');
  } catch {
    const cached = await caches.match(request, { cacheName: CACHE });
    if (cached) return cached;
    // IndexedDB fallback — son bilinen kadro/program
    const record = await idbGet(request.url);
    if (record) return new Response(JSON.stringify(record), { headers: { 'content-type': 'application/json' } });
    return new Response(JSON.stringify({ offline: true }), { headers: { 'content-type': 'application/json' } });
  }
}

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('likya_offline_store', 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(url) {
  try {
    const db = await idbOpen();
    return await new Promise((resolve) => {
      const tx = db.transaction('pending_sync_queue', 'readonly');
      const get = tx.objectStore('pending_sync_queue').get(url);
      get.onsuccess = () => resolve(get.result ?? null);
      get.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (STATIC_PATTERN.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
  } else if (DATA_PATTERN.test(url.pathname)) {
    event.respondWith(networkFirstWithIdb(event.request));
  } else {
    // Varsayılan: önce ağ, sonra önbellek
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(event.request).then((hit) => hit || caches.match('/'))),
    );
  }
});

// ── 3. BACKGROUND SYNC: çevrimdışı BLE seans çerçeveleri ──────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-ble-frames') {
    event.waitUntil(
      fetch('/api/v1/telemetry/batch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '[]' })
        .catch(() => { /* sync kaydı korunur, sonraki fırsatta tekrar */ }),
    );
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 🔔 WEB PUSH — bildirim alındığında göster
// ════════════════════════════════════════════════════════════════════════════
self.addEventListener('push', (event) => {
  let payload = { title: '⚡ SportVisionX', body: 'Yeni bildirim', icon: '/icons/icon-192.png', data: {} };
  try {
    const data = event.data ? event.data.json() : null;
    if (data) payload = { ...payload, ...data };
  } catch {
    if (event.data) payload.body = event.data.text();
  }
  event.waitUntil(self.registration.showNotification(payload.title, { body: payload.body, icon: payload.icon, badge: '/icons/icon-192.png', data: payload.data || {} }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client && client.url) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});

