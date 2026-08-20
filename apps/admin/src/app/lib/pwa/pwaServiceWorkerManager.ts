// ============================================================================
// 📲 PWA SERVICE WORKER YÖNETİCİSİ (Adım 97) — offline-first kort tabletleri
// Cache stratejileri: Cache-First (statik/3D/ses) • Network-First + IndexedDB
// fallback (kadro/program) • Background sync (BLE seans çerçeveleri).
// Deterministik; sıfır bağımlılık; node-runnable.
// ============================================================================

export type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate';

export interface CacheRoute {
  pattern: RegExp;
  strategy: CacheStrategy;
  ttlSec?: number;
}

export const PWA_CACHE_ROUTES: CacheRoute[] = [
  { pattern: /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?|mp3|ogg|glb|gltf|bin)$/, strategy: 'cache-first', ttlSec: 86_400 },
  { pattern: /\/api\/|\/roster|\/schedule/, strategy: 'network-first', ttlSec: 300 },
  { pattern: /^\/$/, strategy: 'stale-while-revalidate', ttlSec: 3600 },
];

export function strategyFor(url: string): CacheRoute | null {
  return PWA_CACHE_ROUTES.find((r) => r.pattern.test(url)) ?? null;
}

export interface CachePolicy {
  strategy: CacheStrategy;
  ttlSec: number;
  note: string;
}

/** URL için cache politikasını döndürür. */
export function buildCachePolicy(url: string): CachePolicy {
  const route = strategyFor(url);
  if (!route) return { strategy: 'network-first', ttlSec: 300, note: 'Varsayılan: önce ağ, sonra önbellek' };
  const notes: Record<CacheStrategy, string> = {
    'cache-first': 'Statik varlık/3D/ses — önbellek öncelikli (çevrimdışı hızlı)',
    'network-first': 'Kadro/program — ağ öncelikli, IndexedDB fallback',
    'stale-while-revalidate': 'Ana sayfa — önbelleği anında, arka planda yenile',
  };
  return { strategy: route.strategy, ttlSec: route.ttlSec ?? 300, note: notes[route.strategy] };
}

/** Tarayıcıda service worker kaydı (node'da no-op). */
export function registerServiceWorker(path = '/sw.js'): { ok: boolean; registered: boolean } {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return { ok: true, registered: false };
  navigator.serviceWorker.register(path).catch(() => undefined);
  return { ok: true, registered: true };
}

/** Background sync kaydı (sync-ble-frames) — node'da no-op. */
export function registerBackgroundSync(tag = 'sync-ble-frames'): boolean {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false;
  const sw = navigator.serviceWorker;
  if (!('sync' in sw)) return false;
  // @ts-expect-error — SyncManager henüz lib.dom'da değil
  sw.ready.then((reg: { sync: { register: (t: string) => Promise<void> } }) => reg.sync.register(tag)).catch(() => undefined);
  return true;
}

/** PWA kurulabilirlik kontrolü (manifest mevcut + HTTPS/localhost). */
export function isInstallable(manifestHref = '/manifest.json'): boolean {
  if (typeof window === 'undefined') return false;
  const secure = window.isSecureContext;
  const link = document.querySelector(`link[rel="manifest"][href="${manifestHref}"]`);
  return secure && !!link;
}

export function pwaManagerStatus(): string {
  return `PWA: ${PWA_CACHE_ROUTES.length} cache rotası • cache-first + network-first/IDB • bg sync BLE`;
}
