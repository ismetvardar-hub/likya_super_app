// ============================================================================
// 🗣️ SESLİ KOÇ (Zero-Cost TTS) — Web Speech API Türkçe geri bildirim
// sensoryFeedbackEngine ile birlikte: metrik eşiğine göre sesli cümle üretir
// ("Harika servis hızı", "Topuk darbesi yüksek, parmak ucuna geç")
// Fallback: açık PlayHT / Edge TTS endpoint (ücretsiz, abonelik yok)
// ============================================================================

export type VoiceCueKey = 'GOOD_SERVE' | 'HEEL_STRIKE' | 'ELITE_RSI' | 'FATIGUE' | 'SPRINT' | 'HR_SPIKE';

export const VOICE_CUES: Record<VoiceCueKey, string> = {
  GOOD_SERVE: 'Harika servis hızı!',
  HEEL_STRIKE: 'Topuk darbesi yüksek, parmak ucuna geç.',
  ELITE_RSI: 'Elit reaktif güç, süper yaylanma!',
  FATIGUE: 'Yorgunluk başlıyor, kısa bir mola ver.',
  SPRINT: 'Harika sprint! Hız rekoru yaklaşıyor.',
  HR_SPIKE: 'Kalp atışı çok yükseldi, nefes al ve toparlan.',
};

export type CueInput = { key: VoiceCueKey; value?: number };

// ---------------------------------------------------------------------------
// 1. Metrik Eşiğinden Sesli Cümle Seçimi
// ---------------------------------------------------------------------------
export function cueForTelemetry(rsi: number, heelPct: number, speedKmh: number, hr: number, fatiguePct: number): string {
  if (fatiguePct > 70) return VOICE_CUES.FATIGUE;
  if (hr >= 185) return VOICE_CUES.HR_SPIKE;
  if (heelPct > 50) return VOICE_CUES.HEEL_STRIKE;
  if (speedKmh > 20) return VOICE_CUES.SPRINT;
  if (rsi >= 2.0) return VOICE_CUES.ELITE_RSI;
  if (speedKmh > 18) return VOICE_CUES.GOOD_SERVE;
  return 'Tempo güzel, devam et!';
}

// ---------------------------------------------------------------------------
// 2. Web Speech API — Türkçe konuş (sıfır maliyet, tarayıcıda)
// ---------------------------------------------------------------------------
export function speakTurkish(text: string, opts?: { rate?: number; onEnd?: () => void }): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'tr-TR';
    utter.rate = opts?.rate ?? 1;
    if (opts?.onEnd) utter.onend = opts.onEnd;
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 3. Fallback: Açık PlayHT / Edge TTS — ücretsiz endpoint (mock-first)
// ---------------------------------------------------------------------------
export function edgeTtsFallbackUrl(text: string): string {
  return `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?text=${encodeURIComponent(text)}&lang=tr-TR&voice=tr-TR-AhmetNeural`;
}

export function playTtsCue(cue: CueInput | string): { spoken: boolean; fallbackUrl: string } {
  const text = typeof cue === 'string' ? cue : VOICE_CUES[cue.key];
  const spoken = speakTurkish(text);
  return { spoken, fallbackUrl: spoken ? '' : edgeTtsFallbackUrl(text) };
}

export function speechFeedbackStatus(): string {
  return `Sesli Koç: ${Object.keys(VOICE_CUES).length} Türkçe cümle • Web Speech + Edge TTS fallback`;
}
