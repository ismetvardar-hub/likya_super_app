// ============================================================================
// 🧬 BİYOMEKANİK GPT — ÖZELLEŞTİRİLMİŞ SPOR BİLİMİ AJANI (Adım 133)
// Yanıtlarını doğrudan ölçülen telemetriye dayandıran doğal dil ajanı:
// veli ve koç sorularını yanıtlar (örn. "Arda'nın ikinci servisindeki hız
// düşüşünün kök nedeni nedir?"). Kinetik zincir gecikmesi, deselerasyon torku
// ve PHV büyüme hızını yerel depolardan referans alır. Kibar, sade terminoloji
// ve ahlaki ton guardrail'leri içerir. Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export interface AthleteTelemetryStore {
  athleteId: string;
  gctTrendMs: number[];       // son GCT ortalamaları
  serveSpeedKmh: number[];    // servis hızları (1. ve 2.)
  kineticLagMs: number;       // son vuruş kinetik gecikmesi
  decelTorque: number;        // deselerasyon torku (N·m)
  phvVelocity: number;        // PHV büyüme hızı (cm/yıl)
  asymmetryPct: number;       // L/R asimetri
}

export type QueryIntent = 'serve_speed_drop' | 'kinetic_lag' | 'deceleration_torque' | 'phv_growth' | 'fatigue_load' | 'technique' | 'unknown';

export interface BiomechanicAnswer {
  intent: QueryIntent;
  answer: string;
  referencedMetrics: string[];
  grounded: boolean;
  safe: boolean;
}

// ── Niyet tespiti (deterministik anahtar kelime) ─────────────────────────────
const INTENT_KEYWORDS: Record<Exclude<QueryIntent, 'unknown'>, string[]> = {
  serve_speed_drop: ['ikinci servis', 'servis hızı', 'hız düşüş', 'servis', 'serve'],
  kinetic_lag: ['kinetik zincir', 'kinetic chain', 'gecikme', 'ayak basışı', 'raket teması'],
  deceleration_torque: ['deselerasyon', 'tork', 'fren', 'decel', 'yavaşlama'],
  phv_growth: ['phv', 'büyüme', 'boy atma', 'growth', 'olgunlaşma'],
  fatigue_load: ['yorgunluk', 'trimp', 'yük', 'fatigue', 'tükenme'],
  technique: ['teknik', 'form', 'vuruş', 'mekanik', 'açı'],
};

export function detectIntent(query: string): QueryIntent {
  const lower = query.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return intent as QueryIntent;
  }
  return 'unknown';
}

// ── Güvenlik & ahlaki ton guardrail'leri ─────────────────────────────────────
const UNSAFE_PATTERNS = ['aptal', 'sala', 'hakaret', 'nefret', 'öl', 'küfür'];

export function isSafeInput(query: string): boolean {
  const lower = query.toLowerCase();
  return !UNSAFE_PATTERNS.some((p) => lower.includes(p));
}

export function applyGuardrails(text: string, safe: boolean): string {
  if (!safe) {
    return 'Bu soruyu yanıtlayamam; ancak sporcunun sağlığı ve gelişimi için ölçümlere dayalı, yapıcı bir değerlendirme sunabilirim.';
  }
  return `Kibarca bilgi: ${text} — (sade dil, ölçüm verilerine dayalı)`;
}

// ── Biyomekanik GPT ajanı ────────────────────────────────────────────────────
export class BiomechanicGptAgent {
  private readonly stores = new Map<string, AthleteTelemetryStore>();

  registerStore(store: AthleteTelemetryStore): void {
    this.stores.set(store.athleteId, store);
  }

  store(athleteId: string): AthleteTelemetryStore | null {
    return this.stores.get(athleteId) ?? null;
  }

  private avg(values: number[]): number {
    return values.length === 0 ? 0 : Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  }

  private groundedText(intent: QueryIntent, store: AthleteTelemetryStore): { text: string; metrics: string[] } {
    const gctAvg = this.avg(store.gctTrendMs);
    const lastServe = store.serveSpeedKmh[store.serveSpeedKmh.length - 1] ?? 0;
    const firstServe = store.serveSpeedKmh[0] ?? lastServe;
    switch (intent) {
      case 'serve_speed_drop':
        return {
          text: `${store.athleteId}'nın ikinci servis hızındaki düşüşün kök nedeni kinetik zincirdeki gecikmedir: ayak basışı → raket teması arası ${store.kineticLagMs}ms gecikme ve deselerasyon torku ${store.decelTorque} N·m. Servis hızı ${firstServe} → ${lastServe} km/h, GCT ortalaması ${gctAvg}ms; PHV büyüme hızı ${store.phvVelocity} cm/yıl.`,
          metrics: ['kineticLagMs', 'decelTorque', 'serveSpeedKmh', 'gctMs', 'phvVelocity'],
        };
      case 'kinetic_lag':
        return {
          text: `Kinetik zincir gecikmesi ${store.kineticLagMs}ms — bu, patlayıcı kuvvet aktarımını azaltır. Deselerasyon torku ${store.decelTorque} N·m ve L/R asimetri %${store.asymmetryPct}.`,
          metrics: ['kineticLagMs', 'decelTorque', 'asymmetryPct'],
        };
      case 'deceleration_torque':
        return {
          text: `Deselerasyon torku ${store.decelTorque} N·m — fren yükü belirgin; GCT ${gctAvg}ms ve asimetri %${store.asymmetryPct} ile birlikte değerlendirilir.`,
          metrics: ['decelTorque', 'gctMs', 'asymmetryPct'],
        };
      case 'phv_growth':
        return {
          text: `PHV büyüme hızı ${store.phvVelocity} cm/yıl — büyüme atağı döneminde yük yönetimi önemli; son GCT ${gctAvg}ms ile büyüme kaynaklı mekanik değişimler izlenmeli.`,
          metrics: ['phvVelocity', 'gctMs'],
        };
      case 'fatigue_load':
        return {
          text: `Yorgunluk bağlamı: GCT ortalaması ${gctAvg}ms ve kinetik gecikme ${store.kineticLagMs}ms — yük toleransı izleniyor; deselerasyon torku ${store.decelTorque} N·m.`,
          metrics: ['gctMs', 'kineticLagMs', 'decelTorque'],
        };
      case 'technique':
        return {
          text: `Teknik değerlendirme: L/R asimetri %${store.asymmetryPct}, kinetik gecikme ${store.kineticLagMs}ms — vuruş mekaniği bu ölçümlerle destekleniyor.`,
          metrics: ['asymmetryPct', 'kineticLagMs'],
        };
      default:
        return {
          text: 'Bu soru için ölçüm bazlı bir yanıt üretmek üzere daha spesifik bir bağlam (servis, kinetik zincir, yorgunluk vb.) paylaşabilir misiniz?',
          metrics: [],
        };
    }
  }

  answer(query: string, athleteId: string): BiomechanicAnswer {
    const safe = isSafeInput(query);
    const store = this.stores.get(athleteId);
    if (!safe) {
      return { intent: 'unknown', answer: applyGuardrails('', false), referencedMetrics: [], grounded: false, safe: false };
    }
    const intent = detectIntent(query);
    if (!store) {
      return { intent, answer: applyGuardrails(`Sporcu "${athleteId}" için telemetri deposu bulunamadı — önce ölçüm verileri kaydedilmeli.`, true), referencedMetrics: [], grounded: false, safe: true };
    }
    const grounded = intent !== 'unknown';
    const { text, metrics } = this.groundedText(intent, store);
    return { intent, answer: applyGuardrails(text, true), referencedMetrics: metrics, grounded, safe: true };
  }
}

export function biomechanicGptStatus(): string {
  return 'Biyomekanik GPT: telemetriye dayalı yanıtlar • kinetik zincir + deselerasyon torku + PHV • sade dil + ahlaki guardrail';
}

