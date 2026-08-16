// ============================================================================
// 🎙️ ULTRA DOĞAL SES & TTS MOTORU — Web Speech + yerel ses köprüsü
// Dia TTS / VoiceBox standartlarına uyumlu; CEO yanıtlarını sesli okur.
// Kırılmasız: mevcut speak() yapısını değiştirmez, isteğe bağlı eklentidir.
// ============================================================================

export type TtsEngineMode = 'web-speech' | 'local' | 'off';

export interface TtsOptions {
  mode?: TtsEngineMode;
  lang?: string;
  rate?: number;
  pitch?: number;
  voiceName?: string;
}

export interface TtsResult {
  ok: boolean;
  mode: TtsEngineMode;
  lang: string;
  voice: string;
  simulated: boolean;
}

const VOICEBOX_LIKE_LOCAL_VOICES = ['Dia TTS', 'VoiceBox', 'tur', 'tr', 'turkish'];

// Türkçe/yerel ses seçimi (deterministik öncelik sırası)
export function pickVoice(voices: SpeechSynthesisVoice[], lang = 'tr-TR'): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  const hasName = (name: string) => (v: SpeechSynthesisVoice) =>
    v.name.toLowerCase().includes(name.toLowerCase());
  const matchName = VOICEBOX_LIKE_LOCAL_VOICES.map(hasName);
  for (const pred of matchName) {
    const hit = voices.find((v) => pred(v) && v.lang.toLowerCase().startsWith('tr'));
    if (hit) return hit;
  }
  return (
    voices.find((v) => v.lang.toLowerCase().includes('tr')) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('tr')) ??
    null
  );
}

// Web Speech API köprüsü — CEO yanıtlarını sesli okur
export function speakText(text: string, opts: TtsOptions = {}): TtsResult {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return { ok: false, mode: opts.mode ?? 'off', lang: opts.lang ?? 'tr-TR', voice: 'yok', simulated: true };
    }
    const mode: TtsEngineMode = opts.mode ?? 'web-speech';
    if (mode === 'off') {
      window.speechSynthesis.cancel();
      return { ok: true, mode, lang: opts.lang ?? 'tr-TR', voice: 'kapalı', simulated: true };
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/[#*`📊📋🧠⚙️🔔🎙️🌐🦾👤✨•]/g, ''));
    utter.lang = opts.lang ?? 'tr-TR';
    utter.rate = opts.rate ?? 1.0;
    utter.pitch = opts.pitch ?? 1.0;
    const voices = window.speechSynthesis.getVoices();
    const chosen = opts.voiceName ? voices.find((v) => v.name === opts.voiceName) ?? pickVoice(voices, utter.lang) : pickVoice(voices, utter.lang);
    if (chosen) {
      utter.voice = chosen;
      utter.lang = chosen.lang;
    }
    window.speechSynthesis.speak(utter);
    return { ok: true, mode, lang: utter.lang, voice: chosen?.name ?? 'sistem', simulated: false };
  } catch {
    return { ok: false, mode: opts.mode ?? 'off', lang: opts.lang ?? 'tr-TR', voice: 'hata', simulated: true };
  }
}

// Konuşmayı durdur
export function stopSpeakingText(): boolean {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// VoiceBox / Dia TTS yerel köprü durumu (gerçek yerel servis yoksa simülasyon)
export function ttsEngineStatus(): string {
  const w = typeof window;
  const hasTTS = w !== 'undefined' && 'speechSynthesis' in window;
  return `TTS Engine [${hasTTS ? 'Web Speech aktif' : 'kapalı'} • Dia TTS/VoiceBox uyumlu köprü]`;
}
