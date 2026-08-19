// ============================================================================
// 🏆 SPORTVISIONX ÖLÇÜM & GELİŞİM RAPORU (Post-Session) — 4 bölümlü
// 1. Performans Özeti & Trendler (geçen hafta kıyası)
// 2. Spor Bilimi Analizi (Yorgunluk & Sakatlık Riski)
// 3. Gelişim Alanları & Antrenör Tavsiyesi (AI)
// 4. Tarihsel Kıyaslama (Trend Analizi)
// Maç bittiği an üretilir → sporcunun telefonuna bildirim + antrenör paneline.
// ============================================================================

export interface ReportHeader {
  athlete: string;
  date: string;
  sessionType: string;
  coach: string;
  totalTime: string;
  trimp: number;
}

export interface MetricTrend {
  label: string;
  lastMonth: string;
  today: string;
  deltaPct: number;
  direction: 'up' | 'down' | 'flat';
  note: string;
}

export interface PerformanceBlock {
  title: string;
  scorePct: number;
  tier: 'Elit' | 'Yüksek' | 'İyi' | 'Gelişmeli';
  lines: string[];      // trend detayları
}

export interface InjuryBlock {
  risk: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK';
  riskSafe: boolean;
  details: string[];
}

export interface DevelopmentBlock {
  positives: string[];
  negatives: string[];
  aiAdvice: string;
}

export interface PostSessionReport {
  header: ReportHeader;
  performance: PerformanceBlock[];
  injury: InjuryBlock;
  fatigue: { status: 'STABİL' | 'UYARI'; note: string };
  development: DevelopmentBlock;
  trends: MetricTrend[];
  notification: string;   // telefona düşen bildirim metni
}

// ---------------------------------------------------------------------------
// 1. Trend Hesabı — bugün vs geçen hafta yüzde değişim
// ---------------------------------------------------------------------------
export function deltaPct(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

// ---------------------------------------------------------------------------
// 2. Rapor Üretimi (deterministik demo verisi — sensör toplamlarından)
// ---------------------------------------------------------------------------
export function generatePostSessionReport(seed = 0): PostSessionReport {
  const s = seed % 11;
  const gctToday = 188 + (s % 8);
  const gctLast = 202 + ((s + 3) % 7);
  const rsiToday = Number((2.02 + (s % 5) * 0.05).toFixed(2));
  const rsiLast = 1.95;
  const armToday = 90 + (s % 3);
  const armLast = 88;
  const hrvToday = 37 + (s % 4);
  const hrvLast = 34 + ((s + 2) % 4);

  const injuryRisk = s >= 8 ? 'ORTA' : 'DÜŞÜK';

  return {
    header: {
      athlete: 'Arda G.',
      date: new Date().toLocaleDateString('tr-TR'),
      sessionType: 'Tenis Maçı (3 Set)',
      coach: 'Caner B.',
      totalTime: '1s 15dk',
      trimp: 240 - s,
    },
    performance: [
      {
        title: '🚀 Patlayıcılık Skoru',
        scorePct: 94 - s,
        tier: s < 4 ? 'Elit' : 'Yüksek',
        lines: [
          `Ort. Zemin Temas (GCT): ${gctToday} ms (Geçen Hafta: ${gctLast} ms | Trend: ${gctToday < gctLast ? '🚀 Gelişiyor' : '📉 Geriledi'})`,
          `Reaktif Güç İndeksi (RSI): ${rsiToday} (Geçen Hafta: ${rsiLast})`,
        ],
      },
      {
        title: '🏎️ Hız & İvmelenme',
        scorePct: 88 - s,
        tier: 'Yüksek',
        lines: [
          'Ort. Sprint Hızı: 19.5 km/h',
          'Sert Frenleme (Decel >-3.5m/s²): 14 adet (Diz Yükü Kontrol Altında) ✅',
        ],
      },
      {
        title: '❤️ Kondisyon (İç Yük)',
        scorePct: 82 - s,
        tier: 'İyi',
        lines: ['Zon 4-5\'te Geçen Süre: 28 dk', `Kalp Hızı Toparlanması (HRR 60s): ${48 + (s % 6)} BPM (Süper!)`],
      },
    ],
    injury: {
      risk: injuryRisk,
      riskSafe: injuryRisk === 'DÜŞÜK',
      details: [
        'Maç boyunca ön ayak basışını korudun (Ort. %72 Ön / %28 Topuk).',
        'Darbe Yükleme Oranı (1.9 kN/s) güvenli sınırlarda.',
      ],
    },
    fatigue: {
      status: s >= 8 ? 'UYARI' : 'STABİL',
      note: s >= 8
        ? 'Yorgunluk 2. setin sonunda başladı — 3. sette temas süren %14 arttı. Toparlanma günü planlayın.'
        : 'Yorgunluk ancak 3. setin sonunda başladı. Temas süren %14 arttı ama sakatlık paterni oluşmadı. HRV verilerin toparlanmanın hızlı olacağını gösteriyor.',
    },
    development: {
      positives: ['Patlayıcı yaylanma ve kondisyonun çok iyi düzeyde. Toparlanman harika.'],
      negatives: ['1 saatten sonra kol savrulma hızın düştü. 1. Servis yüzden azaldı.'],
      aiAdvice: 'Gelecek antrenmanlarda 45. dakikadan sonra yüksek yoğunluklu kol/omuz drillerine ağırlık verilmeli. Fiziksel patlayıcılığı korurken teknik devamlılığı artırmalıyız.',
    },
    trends: [
      { label: 'Zemin Temas (GCT)', lastMonth: '210 ms', today: `${gctToday} ms`, deltaPct: deltaPct(gctToday, 210), direction: gctToday < 210 ? 'up' : 'down', note: gctToday < 210 ? 'Daha Çevik' : 'Uzadı' },
      { label: 'Kol Hızı (Raket)', lastMonth: '88 km/h', today: `${armToday} km/h`, deltaPct: deltaPct(armToday, 88), direction: armToday >= 88 ? 'up' : 'down', note: 'Stabil' },
      { label: 'HRV Toparlanma', lastMonth: `${hrvLast} ms`, today: `${hrvToday} ms`, deltaPct: deltaPct(hrvToday, hrvLast), direction: hrvToday >= hrvLast ? 'up' : 'down', note: 'Daha Zinde' },
    ],
    notification: `🏆 SportVisionX Ölçüm Raporu hazır! Patlayıcılık %${94 - s} (Elit) • Sakatlık Riski: ${injuryRisk} • TRIMP: ${240 - s}. Detaylar için panele bak.`,
  };
}

export function postSessionReportStatus(): string {
  return 'Ölçüm Raporu Motoru: trend • sakatlık riski • AI tavsiye • tarihsel kıyas hazır';
}
