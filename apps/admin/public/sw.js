/* ============================================================
   LİKYA COMMAND CEO — Service Worker (PWA)
   7/24 erişim: ağ öncelikli, çevrimdışıda önbellek yedeği.
   Sürüm: v1 — her güncellemede CACHE adı artırılır.
   ============================================================ */
const CACHE = 'likya-ceo-v1';
const SHELL = ['/', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Ağ öncelikli strateji — çevrimdışında önbellek (son çare ana sayfa)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((hit) => hit || caches.match('/'))
      )
  );
});

// ============================================================
// 🔔 WEB PUSH — bildirim alındığında göster (Adım 04)
// ============================================================
self.addEventListener('push', (event) => {
  let payload = { title: '⚡ ExtremeS', body: 'Yeni bildirim', icon: '/icons/icon-192.png', data: {} };
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
    })
  );
});
