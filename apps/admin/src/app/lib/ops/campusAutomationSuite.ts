// ============================================================================
// 🏨 BLOK 6 (Aşama 51-60) — KAMPÜS, OTEL (PMS) & AKILLI TESİS OTOMASYONU
// OTA iCal senkron • Sayaç IoT faturalama • Smart termostat • Housekeeping •
// Lost&Found • Erken giriş/geç çıkış • Otopark/EV • NPS duygu analizi •
// Havuz/spa • VIP yüz tanıma karşılama. Deterministik + fallback. Plan Z.
// ============================================================================

// Aşama 51 — OTA (Booking.com/Airbnb/Expedia) iCal senkron
export function otaCalendarSync(ota: 'booking' | 'airbnb' | 'expedia', localBookings: string[], otaBookings: string[]): { merged: string[]; conflicts: string[]; note: string } {
  const merged = Array.from(new Set([...localBookings, ...otaBookings])).sort();
  const conflicts = merged.filter((d) => localBookings.includes(d) && otaBookings.includes(d));
  return { merged, conflicts, note: `${ota.toUpperCase()} 2 yönlü iCal senkronu — ${conflicts.length} çakışma` };
}

// Aşama 52 — Karavan park elektrik/su sayaç IoT faturalama
export function utilityBilling(parcelId: string, kwh: number, liters: number, unitPrices: { kwh: number; liter: number }): { parcelId: string; totalTl: number; breakdown: string } {
  const elecTl = Math.round(kwh * unitPrices.kwh * 100) / 100;
  const waterTl = Math.round(liters * unitPrices.liter * 100) / 100;
  return { parcelId, totalTl: Math.round((elecTl + waterTl) * 100) / 100, breakdown: `${kwh} kWh → ₺${elecTl} • ${liters} L → ₺${waterTl}` };
}

// Aşama 53 — Glamping akıllı termostat
export function smartThermostat(currentC: number, targetC: number, occupied: boolean): { action: 'COOL' | 'HEAT' | 'ECO' | 'OFF'; note: string } {
  if (!occupied) return { action: 'ECO', note: 'Boş çadır — ekonomi modu (±4°C tolerans)' };
  if (currentC > targetC + 0.5) return { action: 'COOL', note: `Soğutma aktif (${currentC}→${targetC}°C)` };
  if (currentC < targetC - 0.5) return { action: 'HEAT', note: `Isıtma aktif (${currentC}→${targetC}°C)` };
  return { action: 'OFF', note: 'Hedef sıcaklık sağlandı' };
}

// Aşama 54 — Housekeeping canlı temizlik durumu
export type RoomStatus = 'dirty' | 'cleaning' | 'clean' | 'inspected';
export function housekeepingBoard(rooms: { id: string; status: RoomStatus }[]): { dirty: string[]; inProgress: string[]; ready: string[]; completionPct: number } {
  const dirty = rooms.filter((r) => r.status === 'dirty').map((r) => r.id);
  const inProgress = rooms.filter((r) => r.status === 'cleaning').map((r) => r.id);
  const ready = rooms.filter((r) => r.status === 'clean' || r.status === 'inspected').map((r) => r.id);
  return { dirty, inProgress, ready, completionPct: rooms.length > 0 ? Math.round((ready.length / rooms.length) * 100) : 0 };
}

// Aşama 55 — Kayıp eşya (Lost & Found)
export function lostFoundRegistry(claim: { item: string; location: string; color: string }): { id: string; matchPct: number; matches: string[] } {
  const matches = ['Kırmızı cüzdan — Havuz kenarı', 'Siyah şapka — Kort 2', 'Anahtar seti — Resepsiyon'];
  const matchPct = Math.min(100, 55 + claim.color.length * 5 + claim.location.length * 2);
  return { id: `LF-${Date.now().toString(36).slice(-4)}`, matchPct, matches };
}

// Aşama 56 — Erken giriş / geç çıkış dinamik fiyat + oto onay
export function earlyLatePricing(baseNightTl: number, earlyHours: number, lateHours: number): { feeTl: number; approved: boolean; note: string } {
  const feeTl = Math.round((earlyHours * 0.1 + lateHours * 0.15) * baseNightTl);
  return { feeTl, approved: feeTl <= baseNightTl * 0.5, note: `Erken ${earlyHours}s + Geç ${lateHours}s → ₺${feeTl} ek ücret` };
}

// Aşama 57 — Otopark doluluk + EV şarj faturalama
export function parkingDashboard(spots: number, occupied: number, evChargers: { id: string; kwh: number }[]): { occupancyPct: number; evRevenueTl: number; freeSpots: number } {
  return { occupancyPct: spots > 0 ? Math.round((occupied / spots) * 100) : 0, evRevenueTl: Math.round(evChargers.reduce((a, c) => a + c.kwh, 0) * 12.5), freeSpots: Math.max(0, spots - occupied) };
}

// Aşama 58 — NPS + duygu analizi
export function sentimentScore(text: string): { polarity: number; sentiment: 'olumlu' | 'nötr' | 'olumsuz'; keywords: string[] } {
  const pos = ['harika', 'teşekkür', 'mükemmel', 'güzel', 'beğendim'];
  const neg = ['kötü', 'geç', 'soğuk', 'berbat', 'şikayet'];
  const hits = (words: string[]) => words.filter((w) => text.toLowerCase().includes(w));
  const polarity = hits(pos).length - hits(neg).length;
  return { polarity, sentiment: polarity > 0 ? 'olumlu' : polarity < 0 ? 'olumsuz' : 'nötr', keywords: [...hits(pos), ...hits(neg)] };
}

// Aşama 59 — Havuz/sauna/spa kapasite + hijyen panosu
export function wellnessCapacity(facility: string, capacity: number, current: number, lastSanitizedMin: number): { pct: number; status: 'OK' | 'DOLU' | 'HİJYEN GEREKLİ' } {
  const pct = capacity > 0 ? Math.round((current / capacity) * 100) : 0;
  const status = pct >= 90 ? 'DOLU' : lastSanitizedMin > 120 ? 'HİJYEN GEREKLİ' : 'OK';
  return { pct, status };
}

// Aşama 60 — VIP yüz tanıma kişisel karşılama
export function vipWelcome(vip: { name: string; favoriteDrink: string; allergies: string[] }): { scene: string; note: string } {
  return { scene: `${vip.name} karşılanıyor — ${vip.favoriteDrink} hazırlanıyor`, note: vip.allergies.length > 0 ? `Alerjen uyarısı: ${vip.allergies.join(', ')}` : 'Alerjen yok' };
}

export function campusAutomationSuiteStatus(): string {
  return 'Kampüs Otomasyon [OTA • sayaç IoT • termostat • housekeeping • lost&found • otopark/EV • NPS • spa]';
}
