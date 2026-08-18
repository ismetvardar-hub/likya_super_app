// ============================================================================
// ⏱️ CSM 20s PLAYER-ONLY HUDDLE & 5 HATA TEŞHİSİ
// Mola anında 20 saniyelik oyuncu toplantısı + 5 kritik hata filtresi:
//   Spacing (Alan Paylaşımı) • Coverage (Savunma Kademesi)
//   Timing (Zamanlama) • Communication (İletişim) • Decision (Karar)
// Antrenör paneline tek tıkla "20s Oyuncu Toplantısı Başlat". Plan Z güvenli.
// ============================================================================

import { staffTaskDispatched } from '../ops/dazeHubEventBus';

export type HuddleErrorType = 'Spacing' | 'Coverage' | 'Timing' | 'Communication' | 'Decision';

export interface HuddleError {
  type: HuddleErrorType;
  turkish: string;
  symptom: string;
  oneFix: string;
  weight: number; // 0-100 (maçı etkileme ağırlığı)
}

export const HUDDLE_ERROR_FILTER: HuddleError[] = [
  { type: 'Spacing', turkish: 'Alan Paylaşımı', symptom: 'Oyuncular birbirine 4m altı yakınlaşıyor; pas kanalları kapanıyor.', oneFix: 'Dış kanat çizgiye yaslan; iç oyuncu kademeli genişlet.', weight: 85 },
  { type: 'Coverage', turkish: 'Savunma Kademesi', symptom: 'Savunma hattı geç dönüyor; arkasına koşular serbest.', oneFix: 'Top tarafı daralt, uzak tarafı kademeli sürdür.', weight: 90 },
  { type: 'Timing', turkish: 'Zamanlama', symptom: 'Kesmeler erken/geç; pas + koşu senkronizasyonu yok.', oneFix: 'Kesme, pasla aynı anda başlar (1-2 ritmi).', weight: 75 },
  { type: 'Communication', turkish: 'İletişim', symptom: 'Sesli komut yok; top kaybı sonrası geç uyarı.', oneFix: 'Her top kaybında 2 sesli komut: "bas!" + "kademe!".', weight: 80 },
  { type: 'Decision', turkish: 'Karar Hatası', symptom: 'Yanlış pas güzergahı; statik sahiplikte panik.', oneFix: '3s kuralı: taşı → geri ver → 1-2 al.', weight: 88 },
];

export function detectHuddleErrors(flags: Partial<Record<HuddleErrorType, boolean>>): HuddleError[] {
  return HUDDLE_ERROR_FILTER.filter((e) => flags[e.type]);
}

export interface Huddle20Result {
  startedAt: string;
  durationSec: 20;
  detected: HuddleError[];
  priorityFix: HuddleError | null;
  coachNote: string;
}

/** 20s oyuncu toplantısı — tek tıkla başlat; 5 hata filtresinden tespit edilenleri raporla. */
export function startPlayerHuddle20(flags: Partial<Record<HuddleErrorType, boolean>> = { Coverage: true, Communication: true }): Huddle20Result {
  const detected = detectHuddleErrors(flags);
  const priority = detected.length > 0 ? detected.reduce((a, b) => (b.weight > a.weight ? b : a)) : null;

  // Daze Hub Event Bus: huddle aksiyonu personel zincirine düşer
  staffTaskDispatched(`HD-${Date.now().toString(36).slice(-4).toUpperCase()}`, `20s Oyuncu Toplantısı — ${priority?.turkish ?? 'Genel'}`, 0, detected.length > 0 ? 5 : 2);

  return {
    startedAt: new Date().toISOString(),
    durationSec: 20,
    detected,
    priorityFix: priority,
    coachNote: priority
      ? `${priority.turkish} öncelikli: ${priority.oneFix} (ağırlık ${priority.weight}/100)`
      : '5 hata filtresinde kritik bulgu yok — ritmi koru.',
  };
}

export function csmHuddleEngineStatus(): string {
  return `CSM Huddle Motoru [20s oyuncu toplantısı • ${HUDDLE_ERROR_FILTER.length} hata filtresi: Spacing/Coverage/Timing/Communication/Decision]`;
}
