// ============================================================================
// 📡 SPONSORLUK REKLAM YUVALARI — tesis içi marka/ortaklık alanları
// Slot bazlı sponsorluk paketleri; deterministik fiyatlandırma. Plan Z güvenli.
// ============================================================================

export interface SponsorshipSlot {
  id: string;
  name: string;
  location: string;
  pricePerMonth: number;
  reach: string;
  status: 'açık' | 'dolu' | 'beklemede';
}

export const SPONSORSHIP_SLOTS: SponsorshipSlot[] = [
  { id: 'slot-hero', name: 'Hero Banner (Ana Sayfa)', location: 'CEO Panel / Kiosk', pricePerMonth: 15000, reach: 'Aylık 45K görüntüleme', status: 'açık' },
  { id: 'slot-padel', name: 'Padel Kort Çevresi', location: 'Kort 1-4 Çit Panoları', pricePerMonth: 12000, reach: 'Aylık 8.5K ziyaretçi', status: 'dolu' },
  { id: 'slot-glamp', name: 'Glamping Çadır Markalama', location: 'Konaklama Alanı', pricePerMonth: 18000, reach: 'Gece 120 misafir', status: 'açık' },
  { id: 'slot-mutfak', name: 'Daze Chef Ekranı', location: 'Mutfak & Restoran', pricePerMonth: 10000, reach: 'Günlük 400 servis', status: 'beklemede' },
  { id: 'slot-market', name: 'Pazaryeri Vitrin Üstü', location: 'Dijital Vitrin', pricePerMonth: 9000, reach: 'Aylık 22K tıklama', status: 'açık' },
];

// Açık yuvaları listele
export function availableSlots(): SponsorshipSlot[] {
  return SPONSORSHIP_SLOTS.filter((s) => s.status === 'açık');
}

// Slot rezerve et (deterministik state — bellek)
export function reserveSlot(id: string): { ok: boolean; slot?: SponsorshipSlot; message: string } {
  const slot = SPONSORSHIP_SLOTS.find((s) => s.id === id);
  if (!slot) return { ok: false, message: 'Yuva bulunamadı' };
  if (slot.status !== 'açık') return { ok: false, message: `${slot.name} artık dolu` };
  slot.status = 'beklemede';
  return { ok: true, slot, message: `📡 ${slot.name} rezervasyon talebi alındı (${slot.pricePerMonth.toLocaleString('tr-TR')}₺/ay)` };
}

export function sponsorshipStatus(): string {
  const open = availableSlots().length;
  return `Sponsorluk [${open} açık yuva / ${SPONSORSHIP_SLOTS.length} • padel→vitrin marka alanları]`;
}
