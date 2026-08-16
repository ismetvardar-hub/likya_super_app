// ============================================================================
// 🎬 VİRAL SPOR KLİBİ MOTORU — otomatik Reels/Short taslak üretici
// Sport Vision maç anları ve etkinliklerden kısa özet/klip taslakları oluşturur.
// Deterministik: olay skoru + an çekiciliği → viral puan, başlık, önerilen müzik.
// Kırılmasız: mevcut spor analiz sistemlerini değiştirmez, üzerine eklenir.
// ============================================================================

export interface ClipEvent {
  title: string;
  moment: string; // ör. 'Gol', 'Aşırı pas', 'Rekor şut'
  durationMs: number;
  impactScore: number; // 0-100
  athletes?: string[];
}

export interface ViralDraft {
  title: string;
  hook: string;
  bpm: number;
  caption: string;
  hashtags: string[];
  viralScore: number;
  durationSec: number;
  clips: ClipEvent[];
  simulated: boolean;
}

// Tek olayın viral puanı (deterministik ağırlıklar)
export function viralScore(event: ClipEvent): number {
  const durationBonus = Math.max(0, Math.min(0.15, (30_000 - event.durationMs) / 30_000 * 0.15));
  const momentBonus = /gol|rekor|şut|smaç|ralli|sürpriz|zafer/.test(event.moment.toLowerCase()) ? 0.1 : 0;
  return Math.min(100, Math.round(event.impactScore + durationBonus * 100 + momentBonus * 100));
}

// BPM önerisi (viral klip standartları: 120-140 BPM)
export function suggestBpm(events: ClipEvent[]): number {
  const energy = events.reduce((s, e) => s + e.impactScore, 0) / Math.max(1, events.length);
  return Math.max(118, Math.min(140, Math.round(120 + energy / 10)));
}

// Olaylardan Reels/Short taslağı üret
export function generateReelDraft(events: ClipEvent[]): ViralDraft {
  if (!events || events.length === 0) {
    return {
      title: 'Likya Günü — Saha içinden',
      hook: 'Bugün sahada neler oldu?',
      bpm: 124,
      caption: 'Sahadan çıkanlar burada 🎬 #LikyaKampüsü',
      hashtags: ['LikyaKampüsü', 'Spor', 'Reels'],
      viralScore: 0,
      durationSec: 15,
      clips: [],
      simulated: true,
    };
  }
  const top = [...events].sort((a, b) => viralScore(b) - viralScore(a));
  const best = top[0];
  const score = Math.round(top.reduce((s, e) => s + viralScore(e), 0) / top.length);
  const totalMs = events.reduce((s, e) => s + e.durationMs, 0);

  return {
    title: `${best.moment} anı — ${best.title}`,
    hook: `İzle: ${best.moment} anında yaşananlar! 🔥`,
    bpm: suggestBpm(events),
    caption: `${top[0].title} • en çarpıcı an ${totalMs / 1000}s içinde. Daha fazlası saha içinden!`,
    hashtags: ['LikyaKampüsü', best.moment, 'Spor', 'Viral'],
    viralScore: score,
    durationSec: Math.max(15, Math.round(totalMs / 1000)),
    clips: top.slice(0, 3),
    simulated: true,
  };
}

// Eklenti durum rozeti
export function viralClipStatus(): string {
  return `Viral Klip Motoru [maç anı → Reels/Short taslak • BPM+hashtag+hook]`;
}
