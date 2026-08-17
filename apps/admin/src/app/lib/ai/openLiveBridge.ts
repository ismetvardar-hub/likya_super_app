// ============================================================================
// 🎙️ OPENLIVE BRIDGE — VAD (Ses Etkinliği Algılama) + Barge-In (Araya Girme)
// Bağımsız eklenti adaptörü: Web Audio AnalyserNode + MediaRecorder tabanlı.
// CEO chat'e çift yönlü sesli konuşma yeteneği kazandırır.
// ⚠️ KIRILMASIZ: mevcut lib/voice/openLive.ts'i değiştirmez; üzerine eklenir.
// Deterministik — LLM'ye bağımlı değildir, graceful fallback sağlar.
// ============================================================================

export interface VadOptions {
  /** Konuşma eşiği (0-1 RMS enerji oranı) */
  threshold?: number;
  /** Sessizlik sonrası konuşma sonu sayılan ms */
  minSilenceMs?: number;
  /** Ses çerçevesi boyutu */
  frameSize?: number;
}

export interface VadFrame {
  level: number;
  speaking: boolean;
}

// Zaman alanı verisinden RMS enerji seviyesini hesapla (0-1)
export function computeRmsLevel(timeDomainData: Uint8Array<ArrayBuffer>): number {
  if (!timeDomainData || timeDomainData.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < timeDomainData.length; i++) {
    const norm = (timeDomainData[i] - 128) / 128; // [-1, 1]
    sum += norm * norm;
  }
  return Math.sqrt(sum / timeDomainData.length);
}

// Enerji seviyesinden konuşma kararı (deterministik)
export function vadDecide(level: number, threshold = 0.08): boolean {
  return level >= threshold;
}

// Web Audio AnalyserNode üzerinde çalışan VAD detektörü
export class VadDetector {
  private threshold: number;
  private minSilenceMs: number;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;

  constructor(private context: AudioContext, private stream: MediaStream, opts: VadOptions = {}) {
    this.threshold = opts.threshold ?? 0.08;
    this.minSilenceMs = opts.minSilenceMs ?? 700;
    try {
      const source = context.createMediaStreamSource(stream);
      this.analyser = context.createAnalyser();
      this.analyser.fftSize = 1024;
      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.fftSize);
    } catch {
      this.analyser = null; // VAD desteklenmiyorsa graceful fallback
    }
  }

  /** Anlık ses çerçevesini oku; döndürülen frame her çağrıda günceldir */
  readFrame(): VadFrame {
    if (!this.analyser || !this.dataArray) return { level: 0, speaking: false };
    this.analyser.getByteTimeDomainData(this.dataArray);
    const level = computeRmsLevel(this.dataArray);
    return { level, speaking: vadDecide(level, this.threshold) };
  }

  getMinSilenceMs(): number {
    return this.minSilenceMs;
  }

  dispose(): void {
    this.analyser = null;
    this.dataArray = null;
  }
}

export interface OpenLiveBridgeOptions {
  vad?: VadOptions;
  onSpeechStart?: () => void;
  onSpeechEnd?: (durationMs: number) => void;
  onBargeIn?: () => void;
}

export interface OpenLiveBridge {
  /** Dinleyip dinlemediğini döndürür */
  isListening: () => boolean;
  /** VAD durumunu döndürür */
  vad: () => VadFrame;
  /** Kaydı sonlandır → ses blob'u + süre (transkript için Web Speech STT kullanılır) */
  stop: () => Promise<{ blob: Blob; durationMs: number }>;
  /** Barge-in: aktif konuşmayı keser, yeni komut için kanalı açar */
  bargeIn: () => void;
  /** Kaynakları temizle */
  dispose: () => void;
}


// ============================================================================
// 🎙️ GERÇEK SES TANIMA (STT) — Web Speech API köprüsü (tr-TR)
// webkitSpeechRecognition / SpeechRecognition motorunu kullanır; mikrofon
// kaydı bittiğinde konuşulan metni anında callback'e iletir.
// Desteklenmiyorsa null döner. (Süre-bazlı simülasyon transkript KALDIRILDI.)
// ============================================================================

export interface SpeechRecognitionBridgeOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (finalTranscript: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export interface SpeechRecognitionBridge {
  start: () => void;
  stop: () => void;
  isActive: () => boolean;
  supported: boolean;
}

export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!(window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

export function createSpeechRecognitionBridge(opts: SpeechRecognitionBridgeOptions = {}): SpeechRecognitionBridge | null {
  if (!isSpeechRecognitionSupported()) return null;
  const SR = (window as unknown as { webkitSpeechRecognition: new () => {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((e: any) => void) | null;
    onend: (() => void) | null;
    onerror: ((e: { error: string }) => void) | null;
  } }).webkitSpeechRecognition;
  const recognition = new SR();
  recognition.lang = opts.lang ?? 'tr-TR';
  recognition.continuous = opts.continuous ?? false;
  recognition.interimResults = opts.interimResults ?? false;

  let active = false;
  let finalTranscript = '';

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalTranscript += transcript + ' ';
      else interim += transcript;
    }
    if (interim && opts.interimResults) opts.onResult?.(finalTranscript + interim);
  };

  recognition.onend = () => {
    active = false;
    opts.onEnd?.();
    if (finalTranscript.trim()) opts.onResult?.(finalTranscript.trim());
    finalTranscript = '';
  };

  recognition.onerror = (e) => {
    active = false;
    opts.onError?.(e.error);
  };

  return {
    supported: true,
    start: () => {
      finalTranscript = '';
      active = true;
      try {
        recognition.start();
      } catch {
        active = false;
      }
    },
    stop: () => {
      active = false;
      try { recognition.stop(); } catch { /* ignore */ }
    },
    isActive: () => active,
  };
}


// VAD + Barge-In destekli tam köprü
export async function createOpenLiveBridge(opts: OpenLiveBridgeOptions = {}): Promise<OpenLiveBridge> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  const startedAt = Date.now();
  let listening = true;
  let bargedIn = false;
  let vad: VadDetector | null = null;

  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const context = new Ctx();
    vad = new VadDetector(context, stream, opts.vad ?? {});
    // VAD döngüsü: konuşma başlangıç/bitiş bildirimleri + barge-in izleme
    const loop = setInterval(() => {
      const frame = vad!.readFrame();
      if (frame.speaking) {
        opts.onSpeechStart?.();
        if (bargedIn) {
          bargedIn = false;
          opts.onBargeIn?.();
        }
      } else {
        // sessizlik süresi barge-in penceresi
        opts.onSpeechEnd?.(Date.now() - startedAt);
      }
      void frame;
    }, 120);
    recorder.start(250);
    (recorder as unknown as { _vadLoop?: ReturnType<typeof setInterval> })._vadLoop = loop;
    (recorder as unknown as { _context?: AudioContext })._context = context;
  } catch {
    // VAD kurulamazsa yine de kayıt çalışsın (graceful fallback)
    recorder.start(250);
  }

  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  return {
    isListening: () => listening,
    vad: () => (vad ? vad.readFrame() : { level: 0, speaking: false }),
    bargeIn: () => {
      bargedIn = true; // bir sonraki ses çerçevesinde onBargeIn tetiklenir
    },
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          listening = false;
          stream.getTracks().forEach((t) => t.stop());
          const loop = (recorder as unknown as { _vadLoop?: ReturnType<typeof setInterval> })._vadLoop;
          if (loop) clearInterval(loop);
          const ctx = (recorder as unknown as { _context?: AudioContext })._context;
          if (ctx && ctx.state !== 'closed') ctx.close().catch(() => undefined);
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          const durationMs = Date.now() - startedAt;
          resolve({ blob, durationMs });
        };
        recorder.stop();
      }),
    dispose: () => {
      stream.getTracks().forEach((t) => t.stop());
    },
  };
}

// Köprü sağlık/destek rozeti (canlı durum için)
export function openLiveBridgeStatus(): string {
  const w = typeof window;
  const hasMediaRecorder = w !== 'undefined' && typeof MediaRecorder !== 'undefined';
  const hasAudio = w !== 'undefined' && (typeof AudioContext !== 'undefined' || !!(window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);
  return `OpenLive Bridge [VAD: ${hasAudio ? 'ON' : 'OFF'} • MediaRecorder: ${hasMediaRecorder ? 'ON' : 'OFF'}]`;
}

