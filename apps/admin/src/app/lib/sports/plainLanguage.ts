// ============================================================================
// 💬 PLAIN LANGUAGE KATMANI — spor bilimi metriklerini sade dile çevirir
// GCT < 200ms → 🚀 Patlayıcı / Çevik Basış
// Heel Strike > 50% → ⚠️ Topuk Yüklenmesi (Diz Zorlanma Riski)
// RSI > 2.0 → ⭐ Elit Esneklik ve Reaktif Güç
// Loading Rate > 2.5 kN/s → 🟡 Zemin Darbesi Yüksek (Yumuşak Adımla)
// HRV drop > 20% → 🔋 Yorgunluk Başlangıcı (Mola Zamanı)
// Amaç: CEO/teknik gridleri Sporcu/Antrenör/Veli için okunur kararlara çevirmek.
// Mevcut motorlara dokunmaz — yalnızca sunum katmanı.
// ============================================================================

export type PlainLevel = 'ELIT' | 'IYI' | 'DIKKAT' | 'RISK';

export interface PlainMetric {
  emoji: string;
  title: string;
  detail: string;
  level: PlainLevel;
  scorePct: number;      // 0-100 kullanıcı dostu skor
}

// ---------------------------------------------------------------------------
// 1. Zemin Temas Süresi (GCT)
// ---------------------------------------------------------------------------
export function gctPlain(gctMs: number): PlainMetric {
  if (gctMs < 200) return { emoji: '🚀', title: 'Patlayıcı / Çevik Basış', detail: `Zemin temasın ${gctMs} ms — ayak yerde gereksiz durmuyor, elastik enerji en üst düzeyde.`, level: 'ELIT', scorePct: 95 };
  if (gctMs < 220) return { emoji: '👌', title: 'İyi Temas', detail: `Zemin temasın ${gctMs} ms — hedef <200 ms; kısa sıçrama çalışmalarıyla geliştirilebilir.`, level: 'IYI', scorePct: 75 };
  return { emoji: '⚠️', title: 'Uzayan Temas (Yorgunluk Belirtisi)', detail: `Zemin temasın ${gctMs} ms — reaktif güç düşüyor; mola önerilir.`, level: 'DIKKAT', scorePct: 45 };
}

// ---------------------------------------------------------------------------
// 2. Topuk / Ön Ayak Basış Dağılımı (Heel Strike)
// ---------------------------------------------------------------------------
export function footStrikePlain(heelPct: number): PlainMetric {
  if (heelPct > 50) return { emoji: '⚠️', title: 'Topuk Yüklenmesi (Diz Zorlanma Riski)', detail: `Basışlarının %${heelPct} topuk üzerinde — diz eklemine binen şok artıyor; ön ayak basışına geç.`, level: 'DIKKAT', scorePct: 40 };
  if (heelPct > 35) return { emoji: '👟', title: 'Karma Basış', detail: `Ön ayak ağırlıklı (%${100 - heelPct}) ama topuk payı yüksek; patlayıcılık için ön ayak oranını artır.`, level: 'IYI', scorePct: 70 };
  return { emoji: '🟢', title: 'Sağlıklı Basış', detail: `Ön ayak baskın (%${100 - heelPct}) — sprint ve hücum için ideal paterndesin.`, level: 'ELIT', scorePct: 92 };
}

// ---------------------------------------------------------------------------
// 3. Reaktif Güç İndeksi (RSI)
// ---------------------------------------------------------------------------
export function rsiPlain(rsi: number): PlainMetric {
  if (rsi > 2.0) return { emoji: '⭐', title: 'Elit Esneklik ve Reaktif Güç', detail: `RSI ${rsi} — kas-tendon yaylanman profesyonel seviyede; patlayıcılık avantajın.`, level: 'ELIT', scorePct: 95 };
  if (rsi > 1.5) return { emoji: '💪', title: 'İyi Reaktif Güç', detail: `RSI ${rsi} — sağlam temel; sıçrama ve çeviklik drillleriyle elit banda çıkabilirsin.`, level: 'IYI', scorePct: 72 };
  return { emoji: '📉', title: 'Reaktif Güç Gelişmeli', detail: `RSI ${rsi} — düşük; plyometrik (sıçrama) egzersizleri önerilir.`, level: 'DIKKAT', scorePct: 45 };
}

// ---------------------------------------------------------------------------
// 4. Darbe Yükleme Oranı (Loading Rate)
// ---------------------------------------------------------------------------
export function loadingRatePlain(loadingKnS: number): PlainMetric {
  if (loadingKnS > 2.5) return { emoji: '🟡', title: 'Zemin Darbesi Yüksek (Yumuşak Adımla)', detail: `Darbe ${loadingKnS} kN/s — stres kırığı riskini azaltmak için iniş tekniğine çalış.`, level: 'RISK', scorePct: 35 };
  if (loadingKnS > 2.2) return { emoji: '👌', title: 'Darbe Kontrollü', detail: `Darbe ${loadingKnS} kN/s — güvenli sınırda ama yumuşak inişle daha da iyileşir.`, level: 'IYI', scorePct: 70 };
  return { emoji: '🟢', title: 'Yumuşak İniş — Güvenli', detail: `Darbe ${loadingKnS} kN/s — eklem ve menisküs yükü normal sınırlarda.`, level: 'ELIT', scorePct: 90 };
}


// ---------------------------------------------------------------------------
// 5. HRV Düşüşü → Yorgunluk
// ---------------------------------------------------------------------------
export function hrvDropPlain(currentHrv: number, baselineHrv: number): PlainMetric {
  const dropPct = baselineHrv > 0 ? Math.round(((baselineHrv - currentHrv) / baselineHrv) * 100) : 0;
  if (dropPct > 20) return { emoji: '🔋', title: 'Yorgunluk Başlangıcı (Mola Zamanı)', detail: `HRV %${dropPct} düştü — otonom sistem yorgun; toparlanma günü planla.`, level: 'RISK', scorePct: 30 };
  if (dropPct > 10) return { emoji: '⚡', title: 'Hafif Yorgunluk', detail: `HRV %${dropPct} düştü — seansı hafif tempoda bitir.`, level: 'DIKKAT', scorePct: 55 };
  return { emoji: '🫀', title: 'Toparlanma Stabil', detail: `HRV değişimi %${dropPct} — vücut yüke iyi adapte oluyor.`, level: 'IYI', scorePct: 82 };
}

// ---------------------------------------------------------------------------
// 6. Kalp Hızı (HR) — Efor Zonu
// ---------------------------------------------------------------------------
export function heartRatePlain(hr: number, maxHr = 190): PlainMetric {
  const pct = Math.round((hr / maxHr) * 100);
  if (pct >= 90) return { emoji: '🔥', title: 'Zon 5 — Maksimum Efor', detail: `Nabzın ${hr} bpm — kısa süreli dayanılır; süreyi uzatma.`, level: 'DIKKAT', scorePct: 50 };
  if (pct >= 80) return { emoji: '❤️‍🔥', title: 'Zon 4 — Anaerobik', detail: `Nabzın ${hr} bpm — yüksek yoğunluklu hücum fazı.`, level: 'IYI', scorePct: 68 };
  return { emoji: '❤️', title: 'Zon 2-3 — Kontrollü Efor', detail: `Nabzın ${hr} bpm — kondisyon bölgesinde, güvenli.`, level: 'ELIT', scorePct: 88 };
}

export function plainLanguageStatus(): string {
  return 'Sade Dil Katmanı: GCT • Basış • RSI • Darbe • HRV • Nabız → emoji + skor + cümle';
}

