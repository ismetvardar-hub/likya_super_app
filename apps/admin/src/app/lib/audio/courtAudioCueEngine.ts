// ============================================================================
// 🔊 SAHA SESLİ İŞARET & HAPTİK GERİ BİLDİRİM MOTORU (Adım 73)
// Sıfır-asset sentezlenmiş tonlar (Web Audio osilatörü) + mobil titreşim desenleri
// • DRILL_START (yüksek bip) • DRILL_STOP (çift zil) • INJURY_ALARM (uyarı vızıltısı)
// • PB_ACHIEVED (yükselen üçlü fanfar)
// Web Audio / Navigator Vibration olmayan ortamlar için güvenli fallback.
// Ton/haptik meta verileri saf ve test edilebilir.
// ============================================================================

export type CueName = 'DRILL_START' | 'DRILL_STOP' | 'INJURY_ALARM' | 'PB_ACHIEVED';

export interface ToneDescriptor {
  freq: number;       // Hz
  durationMs: number;
  type: OscillatorType;
  delayMs: number;    // önceki tondan gecikme
}

export const TONE_PRESETS: Record<CueName, ToneDescriptor[]> = {
  DRILL_START: [{ freq: 1100, durationMs: 120, type: 'square', delayMs: 0 }],
  DRILL_STOP: [
    { freq: 880, durationMs: 100, type: 'sine', delayMs: 0 },
    { freq: 660, durationMs: 100, type: 'sine', delayMs: 140 },
  ],
  INJURY_ALARM: [
    { freq: 220, durationMs: 300, type: 'sawtooth', delayMs: 0 },
    { freq: 220, durationMs: 300, type: 'sawtooth', delayMs: 340 },
  ],
  PB_ACHIEVED: [
    { freq: 523.25, durationMs: 150, type: 'triangle', delayMs: 0 },
    { freq: 659.25, durationMs: 150, type: 'triangle', delayMs: 180 },
    { freq: 783.99, durationMs: 220, type: 'triangle', delayMs: 360 },
  ],
};

/** Ton preset'ini döndürür (test/UI için saf meta veri). */
export function tonePreset(name: CueName): ToneDescriptor[] {
  return TONE_PRESETS[name];
}

export type HapticName = 'countdown' | 'critical-asymmetry' | 'pb';

export const HAPTIC_PATTERNS: Record<HapticName, number[]> = {
  'countdown': [100, 50, 100],
  'critical-asymmetry': [500],
  'pb': [80, 40, 80, 40, 160],
};

/** Haptik desenini döndürür (ms dizisi). */
export function hapticPattern(name: HapticName): number[] {
  return HAPTIC_PATTERNS[name];
}

export interface CueResult {
  ok: boolean;
  usedWebAudio: boolean;
  usedVibration: boolean;
  fallback: boolean;
}

/** İşareti çalar: Web Audio + vibrasyon; desteklenmiyorsa güvenli fallback. */
export function playCue(name: CueName, haptic?: HapticName): CueResult {
  const tones = TONE_PRESETS[name];
  let usedWebAudio = false;
  let fallback = false;
  let usedVibration = false;

  try {
    const Ctor = (globalThis as Record<string, unknown>).AudioContext ?? (globalThis as Record<string, unknown>).webkitAudioContext;
    if (typeof Ctor === 'function') {
      const ctx = new (Ctor as new () => AudioContext)();
      let at = ctx.currentTime;
      for (const t of tones) {
        at += t.delayMs / 1000;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = t.type;
        osc.frequency.value = t.freq;
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.25, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + t.durationMs / 1000);
        osc.connect(gain).connect(ctx.destination);
        osc.start(at);
        osc.stop(at + t.durationMs / 1000 + 0.05);
      }
      usedWebAudio = true;
    } else {
      fallback = true;
    }
  } catch {
    fallback = true;
  }

  try {
    if (haptic && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(HAPTIC_PATTERNS[haptic]);
      usedVibration = true;
    }
  } catch {
    /* vibrasyon yok */
  }

  return { ok: usedWebAudio || fallback, usedWebAudio, usedVibration, fallback };
}

export function courtAudioCueStatus(): string {
  return 'Sesli İşaret: DRILL_START/STOP • INJURY_ALARM • PB fanfar + haptik desenler';
}
