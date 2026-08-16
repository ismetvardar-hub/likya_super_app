// ============================================================================
// 🎙️ LİKYA OPENLIVE — Çift Yönlü Ses Köprüsü (MediaRecorder + Konuşma)
// CEO chat'e sesli komut girişi: Web Speech yoksa MediaRecorder fallback.
// Yanıtları SpeechSynthesis ile seslendirir (tarayıcı içi, ücretsiz).
// Deterministik — STT anahtarı yoksa süreye dayalı kural yazılımı kullanır.
// ============================================================================

export interface VoiceSupport {
  webSpeech: boolean;
  mediaRecorder: boolean;
  speechSynthesis: boolean;
}

export function getVoiceSupport(): VoiceSupport {
  const w = typeof window;
  return {
    webSpeech: w !== 'undefined' && !!(window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
    mediaRecorder: w !== 'undefined' && typeof MediaRecorder !== 'undefined',
    speechSynthesis: w !== 'undefined' && 'speechSynthesis' in window,
  };
}

// Deterministik "transkript" fallback: süreye göre anlamlı demo komut
export function transcribeFallback(durationMs: number): string {
  if (durationMs < 1200) return 'Likya durum raporu nedir?';
  if (durationMs < 2500) return 'Bugünkü yoğunluk ve stok durumunu özetle';
  if (durationMs < 4000) return 'Otonom vardiya motorunu çalıştır ve personel davetini başlat';
  return 'Tesis ve saha durumunu analiz et, kritikse beni bilgilendir';
}

export interface OpenLiveSession {
  stop: () => Promise<{ blob: Blob; durationMs: number; fallbackTranscript: string }>;
  state: () => 'inactive' | 'recording';
}

// MediaRecorder tabanlı ses kayıt oturumu
export async function startOpenLiveRecording(): Promise<OpenLiveSession> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  const startedAt = Date.now();

  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.start(250);

  return {
    state: () => (recorder.state === 'recording' ? 'recording' : 'inactive'),
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          const durationMs = Date.now() - startedAt;
          resolve({ blob, durationMs, fallbackTranscript: transcribeFallback(durationMs) });
        };
        recorder.stop();
      }),
  };
}

// Yanıtı seslendir (TTS) — Web Speech + SpeechSynthesis
export function speakResponse(text: string): boolean {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/[#*`📊📋🧠⚙️🔔🎙️]/g, ''));
    utter.lang = 'tr-TR';
    utter.rate = 1.05;
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}

// OpenLive durum rozeti
export function openLiveStatus(): string {
  const s = getVoiceSupport();
  const parts: string[] = [];
  if (s.webSpeech) parts.push('Web Speech');
  if (s.mediaRecorder) parts.push('MediaRecorder');
  if (s.speechSynthesis) parts.push('TTS');
  return parts.length > 0 ? parts.join(' • ') : 'destek yok';
}
