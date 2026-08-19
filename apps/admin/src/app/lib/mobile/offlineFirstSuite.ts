// ============================================================================
// 📱 BLOK 8 (Aşama 71-80) — MOBİL DENEYİM, OFFLINE-FIRST PWA & IOT
// BLE temassız kapı • İndoor navigasyon • Apple/Google Wallet • Kamera kalori •
// Geofence push • Akıllı bileklik nabız • SW cache • Kiosk heartbeat • NFC •
// OLED koyu tema. Deterministik + fallback. Plan Z.
// ============================================================================

// Aşama 71 — BLE temassız kapı açma
export function bleDoorUnlock(userId: string, doorId: string, rssi: number): { ok: boolean; note: string } {
  const ok = rssi > -70 && userId.length > 2;
  return { ok, note: ok ? `${doorId} BLE ile açıldı (sinyal ${rssi} dBm)` : 'Sinyal zayıf — yaklaşın' };
}

// Aşama 72 — İndoor positioning (RSSI trilaterasyon)
export function indoorPosition(beacons: { id: string; x: number; y: number; rssi: number }[]): { x: number; y: number; accuracyM: number } {
  const weighted = beacons.reduce((acc, b) => { const w = Math.max(0, -b.rssi - 40) || 1; return { x: acc.x + b.x * w, y: acc.y + b.y * w, w: acc.w + w }; }, { x: 0, y: 0, w: 0 });
  return { x: Math.round((weighted.x / weighted.w) * 10) / 10, y: Math.round((weighted.y / weighted.w) * 10) / 10, accuracyM: beacons.length >= 3 ? 1.5 : 4 };
}

// Aşama 73 — Apple/Google Wallet dijital kart
export function walletPass(kind: 'membership' | 'ticket', holder: string, code: string): { passId: string; qrPayload: string; format: 'apple' | 'google' } {
  return { passId: `PK-${Date.now().toString(36).slice(-6)}`, qrPayload: `${kind.toUpperCase()}|${code}|${holder}`, format: code.startsWith('AP') ? 'apple' : 'google' };
}

// Aşama 74 — Mobil kamera kalori/besin analizi
export function cameraNutrition(itemHint: string, portionGrams: number): { estimatedCal: number; proteinG: number; carbG: number } {
  const calPer100 = itemHint.includes('et') ? 220 : itemHint.includes('salata') ? 60 : 180;
  const ratio = portionGrams / 100;
  return { estimatedCal: Math.round(calPer100 * ratio), proteinG: Math.round((calPer100 * 0.08) * ratio), carbG: Math.round((calPer100 * 0.1) * ratio) };
}

// Aşama 75 — Geofence giriş push bildirimi
export function geofenceWelcome(zone: string, member: string, inside: boolean): { trigger: boolean; message: string } {
  return { trigger: inside, message: inside ? `Hoş geldiniz ${member} — ${zone} bölgesine giriş tespit edildi` : 'Bölge dışı' };
}

// Aşama 76 — Akıllı bileklik / Watch canlı nabız köprüsü
export function wearableHeartRate(samples: number[]): { avgBpm: number; zone: 'dinlenme' | 'yağ yakımı' | 'kardiyo' | 'maksimal' } {
  const avg = samples.length > 0 ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length) : 70;
  const zone = avg >= 170 ? 'maksimal' : avg >= 130 ? 'kardiyo' : avg >= 100 ? 'yağ yakımı' : 'dinlenme';
  return { avgBpm: avg, zone };
}

// Aşama 77 — PWA Service Worker önbellek + arka plan senkron
export function swCacheStrategy(url: string, cacheName = 'likya-shell-v1'): { strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate'; cacheKey: string } {
  const strategy = url.includes('/api/') ? 'network-first' : url.includes('.js') ? 'cache-first' : 'stale-while-revalidate';
  return { strategy, cacheKey: `${cacheName}::${url.slice(0, 60)}` };
}

// Aşama 78 — Kiosk heartbeat & remote reboot
export function kioskHeartbeat(kioskId: string, lastSeenSec: number): { status: 'online' | 'idle' | 'offline'; action: string | null } {
  if (lastSeenSec < 30) return { status: 'online', action: null };
  if (lastSeenSec < 120) return { status: 'idle', action: null };
  return { status: 'offline', action: `REBOOT:${kioskId}` };
}

// Aşama 79 — NFC ekipman kiralama/iade doğrulama
export function nfcEquipmentCheck(tagId: string, rentedTags: string[]): { ok: boolean; action: 'kirala' | 'iade' } {
  const rented = rentedTags.includes(tagId);
  return { ok: true, action: rented ? 'iade' : 'kirala' };
}

// Aşama 80 — OLED koyu tema HUD
export function oledDarkPalette(accent: string): { bg: string; fg: string; accent: string; note: string } {
  return { bg: '#000000', fg: '#a0a0a0', accent, note: 'Piksel tamamen kapalı — OLED pil tasarrufu aktif' };
}

export function offlineFirstSuiteStatus(): string {
  return 'Offline-First [BLE • indoor nav • wallet pass • kalori vision • geofence • SW cache • NFC • OLED]';
}
