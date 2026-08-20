// ============================================================================
// 🔊 DUYUSAL GERİ BİLDİRİM MOTORU (Adım 12)
// Web Audio API ile sıfır dosya bağımlılıklı sentez beep/cue + mobil haptik:
//   🟢 Success/Target: yüksek chime (hızlı GCT / elit RSI)
//   🟡 Caution: çift orta ton beep (yorgunluk başlangıcı)
//   🔴 Injury: düşük frekanslı pulsating buzzer
// navigator.vibrate() desenleri mobil cihazlarda eşlik eder.
// LivePerformanceHub eşik ihlallerine bağlanır.
// ============================================================================

export type SensoryKind = 'SUCCESS' | 'CAUTION' | 'WARNING';

// ---------------------------------------------------------------------------
// 1. Tone Desenleri (Web Audio — saf tanım, test edilebilir)
// ---------------------------------------------------------------------------
export interface ToneStep { freq: number; startSec: number; durSec: number; type?: OscillatorType; volume?: number; }

export const TONE_PATTERNS: Record<SensoryKind, ToneStep[]> = {
  SUCCESS: [
    { freq: 880, startSec: 0, durSec: 0.12, type: 'sine', volume: 0.18 },
    { freq: 1174, startSec: 0.14, durSec: 0.2, type: 'sine', volume: 0.18 },
  ],
  CAUTION: [
    { freq: 520, startSec: 0, durSec: 0.12, type: 'triangle', volume: 0.15 },
    { freq: 520, startSec: 0.18, durSec: 0.12, type: 'triangle', volume: 0.15 },
  ],
  WARNING: [
    { freq: 130, startSec: 0, durSec: 0.28, type: 'sawtooth', volume: 0.16 },
    { freq: 130, startSec: 0.34, durSec: 0.28, type: 'sawtooth', volume: 0.16 },
    { freq: 130, startSec: 0.68, durSec: 0.3, type: 'sawtooth', volume: 0.16 },
  ],
};

// ---------------------------------------------------------------------------
// 2. Haptik Desenleri (navigator.vibrate)
// ---------------------------------------------------------------------------
export const HAPTIC_PATTERNS: Record<SensoryKind, number[]> = {
  SUCCESS: [40, 40, 40],
  CAUTION: [60, 50, 60],
  WARNING: [120, 60, 120, 60, 240],
};

// ---------------------------------------------------------------------------
// 3. Oynatma (tarayıcı API'leri — SSR güvenli)
// ---------------------------------------------------------------------------
export function playFeedback(kind: SensoryKind, opts?: { audio?: boolean; haptic?: boolean }): void {
  if (typeof window === 'undefined') return;
  if (opts?.haptic !== false && 'vibrate' in navigator) {
    try { navigator.vibrate(HAPTIC_PATTERNS[kind]); } catch { /* bazı tarayıcılar izin vermez */ }
  }
  if (opts?.audio === false) return;
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    TONE_PATTERNS[kind].forEach((s) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = s.type ?? 'sine';
      osc.frequency.value = s.freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + s.startSec);
      gain.gain.linearRampToValueAtTime(s.volume ?? 0.15, ctx.currentTime + s.startSec + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + s.startSec + s.durSec);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + s.startSec);
      osc.stop(ctx.currentTime + s.startSec + s.durSec + 0.05);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch { /* ses engellendi — haptik devam eder */ }
}

// ---------------------------------------------------------------------------
// 4. Eşik → Duyusal Karar (LivePerformanceHub bağlantısı)
// ---------------------------------------------------------------------------
export function sensoryForThreshold(gctMs: number, rsi: number, fatigueRisk: number): SensoryKind {
  if (gctMs > 220 || fatigueRisk > 60) return 'WARNING';
  if (gctMs > 200 || fatigueRisk > 40) return 'CAUTION';
  if (rsi >= 2.0) return 'SUCCESS';
  return 'SUCCESS';
}

export function sensoryFeedbackStatus(): string {
  return `Duyusal Motor: ${Object.keys(TONE_PATTERNS).length} desen • Web Audio + vibrate • eşik bağlantısı hazır`;
}
