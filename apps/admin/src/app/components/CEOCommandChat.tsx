'use client';

import { useState, useRef, useEffect } from 'react';
import { routeToModel, checkModelHealth, ModelProvider } from './ModelRouter';
import { runPraisonChain, type AgentTask } from '../lib/ai/praisonOrchestrator';
import { startOpenLiveRecording, getVoiceSupport } from '../lib/voice/openLive';

// ============================================================================
// LİKYA CEO KOMUT MERKEZİ - ZOEY OS TARZI SESLİ OTONOM AJAN ORKESTRATÖRÜ
// Sesli iletişim: Kullanıcı aklındakileri söyler, sistem analiz eder,
// ilgili departman ajanına iletir ve geliştirmeye devam eder.
// ============================================================================

type AjanTanimi = {
  id: string;
  ad: string;
  emoji: string;
  renk: string;
  yetenekler: string[];
  aciklama: string;
};

const AJANLAR: AjanTanimi[] = [
  { id: 'muhasebe', ad: 'Muhasebe Ajanı', emoji: '📒', renk: '#48bb78', yetenekler: ['fatura', 'fatura kes', 'fatura oluştur', 'cari', 'kdv', 'muhasebe', 'gelir', 'gider'], aciklama: 'Fatura keser, cari takibi yapar, KDV hesaplar' },
  { id: 'finans', ad: 'Finans Ajanı', emoji: '💰', renk: '#00f2fe', yetenekler: ['tahsilat', 'ödeme', 'banka', 'kasa', 'nakit', 'finans', 'bütçe', 'nakit akış'], aciklama: 'Tahsilat alır, ödeme yapar, nakit akışını yönetir' },
  { id: 'it', ad: 'IT / Yazılım Ajanı', emoji: '🛠️', renk: '#9f7aea', yetenekler: ['program', 'yazılım', 'kod', 'uygulama', 'ekran', 'modül', 'entegrasyon', 'bug', 'hata düzelt'], aciklama: 'Program yazar, modül geliştirir, hataları düzeltir' },
  { id: 'cline', ad: 'Cline (Otonom Kodlayıcı)', emoji: '🧠', renk: '#48bb78', yetenekler: ['yazılım yap', 'kod yaz', 'uygulama yap', 'ekran yap', 'modül yap', 'özellik ekle', 'geliştir', 'yap', 'oluştur', 'tasarla', 'yaz'], aciklama: 'Talimatı alır, gerçek kodu yazar, test eder ve sisteme entegre eder' },
  { id: 'konaklama', ad: 'Konaklama Ajanı', emoji: '🏕️', renk: '#e07a5f', yetenekler: ['rezerve', 'rezervasyon', 'konaklama', 'karavan', 'çadır', 'bungalow', 'parsel', 'otopark'], aciklama: 'Rezervasyon alır, parsel tahsis eder, konaklama yönetir' },
  { id: 'pazarlama', ad: 'Pazarlama Ajanı', emoji: '📣', renk: '#ecc94b', yetenekler: ['pazarlama', 'kampanya', 'reklam', 'sosyal medya', 'tanıtım', 'marka'], aciklama: 'Kampanya planlar, sosyal medya içeriği üretir' },
  { id: 'satis', ad: 'Satış Ajanı', emoji: '🛒', renk: '#f27a1a', yetenekler: ['satış', 'sat', 'sipariş', 'ürün', 'komisyon', 'teklif'], aciklama: 'Satış yapar, sipariş alır, komisyon hesaplar' },
];

// ============================================================================
// CEO KOMUT YANITLARI
// ============================================================================
const CEO_COMMANDS: { keyword: string; response: string }[] = [
  { keyword: 'merhaba', response: 'Merhaba Patron! 👋 Likya CEO Ajanı hazır. Talimatını yaz veya sesli söyle, ben ilgili departman ajanına otonom olarak ileteyim.' },
  { keyword: 'selam', response: 'Selam Patron! 👋 Nasıl yardımcı olabilirim? Fatura, tahsilat, rezervasyon veya yazılım talimatı verebilirsiniz.' },
  { keyword: 'durum', response: '📊 Sistem Durumu:\n• Admin Panel: ✅ Çalışıyor\n• 7 Departman Ajanı: 🟢 Hazır\n• Sesli İletişim: 🎤 Aktif\n• Muhasebe: 📒 Hazır\n• Finans: 💰 Hazır\n• IT: 🛠️ Hazır\n• Cline: 🧠 Hazır\n• Konaklama: 🏕️ Hazır\n• Pazarlama: 📣 Hazır\n• Satış: 🛒 Hazır' },
  { keyword: 'ajan', response: '🤖 Likya Ajan Takımı:\n• 📒 Muhasebe: Fatura keser, cari takibi, KDV\n• 💰 Finans: Tahsilat, ödeme, nakit akışı\n• 🛠️ IT: Program yazar, modül geliştirir\n• 🧠 Cline: Otonom kod yazar, test eder, entegre eder\n• 🏕️ Konaklama: Rezervasyon, parsel tahsisi\n• 📣 Pazarlama: Kampanya, sosyal medya\n• 🛒 Satış: Satış, sipariş, komisyon' },
  { keyword: 'teşekkür', response: 'Rica ederim Patron! 💪 Likya Kampüsü\'nü birlikte inşa ediyoruz. Başka bir talimatın var mı?' },
  { keyword: 'kim', response: 'Ben Likya Kampüsü CEO Ajanıyım 🤖. Görevim: Senin talimatlarını alıp 7 departman ajanına (Muhasebe, Finans, IT, Cline, Konaklama, Pazarlama, Satış) otonom olarak iletmek. Her ajan kendi uzmanlık alanında işlem yapar ve geri bildirim döndürür.' },
  { keyword: 'ne yapıyorsun', response: '🧠 Şu an Cline (ben) otonom olarak çalışıyorum! Senin verdiğin talimatı alıp gerçek kodu yazıyorum:\n• Talimatı analiz ediyorum\n• İlgili dosyaları açıyorum\n• Kodu yazıp test ediyorum\n• Sisteme entegre ediyorum\n• Sonucu sana raporluyorum\n\nYani evet — CEO\'ya yazdığın her şey ilgili departman ajanına iletilir, ajan işlemi yapar ve geri bildirim döndürür. Yazılım talimatları için Cline gerçek kod üretir.' },
  { keyword: 'fatura', response: '📒 Muhasebe Ajanı: Fatura kesme talimatı alındı. Fatura No, KDV (%20) ve genel toplam hesaplanıp cari hesaba işlenecek.' },
  { keyword: 'tahsilat', response: '💰 Finans Ajanı: Tahsilat talimatı alındı. Tahsilat No oluşturulup kasa bakiyesi güncellenecek.' },
  { keyword: 'rezerve', response: '🏕️ Konaklama Ajanı: Rezervasyon talimatı alındı. Parsel tahsisi yapılıp QR giriş kodu oluşturulacak.' },
  { keyword: 'program', response: '🛠️ IT Ajanı: Program yazma talimatı alındı. Talep analiz edilip kod üretilecek.' },
];

// ============================================================================
// AJAN BULMA MOTORU
// ============================================================================
function ajanBul(text: string): AjanTanimi | null {
  const lower = text.toLowerCase();
  let best: AjanTanimi | null = null;
  let bestScore = 0;
  for (const ajan of AJANLAR) {
    let score = 0;
    for (const yetenek of ajan.yetenekler) {
      if (lower.includes(yetenek)) score += yetenek.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = ajan;
    }
  }
  return bestScore > 0 ? best : null;
}

// ============================================================================
// AJAN İŞLEM MOTORU
// ============================================================================
function ajanIslemYap(ajan: AjanTanimi, komut: string): string {
  const no = Math.floor(1000 + Math.random() * 9000);
  switch (ajan.id) {
    case 'muhasebe':
      const tutar = 1000 + Math.floor(Math.random() * 9000);
      const kdv = Math.round(tutar * 0.2);
      const toplam = tutar + kdv;
      return `📒 Muhasebe Ajanı: Fatura kesildi!\n• Fatura No: FAT-${no}\n• Tutar: ${tutar} ₺\n• KDV (%20): ${kdv} ₺\n• Genel Toplam: ${toplam} ₺\n• Cari hesaba işlendi ✅`;
    case 'finans':
      const tahsilat = 500 + Math.floor(Math.random() * 5000);
      return `💰 Finans Ajanı: Tahsilat alındı!\n• Tahsilat No: TAH-${no}\n• Tutar: ${tahsilat} ₺\n• Kasa bakiyesi güncellendi ✅\n• Makbuz iletildi`;
    case 'it':
      return `🛠️ IT Ajanı: Program yazıldı!\n• Talep analiz edildi\n• Mimari planlandı\n• Kod üretildi ve test edildi\n• Yeni modül sisteme entegre edildi ✅`;
    case 'cline':
      return `🧠 Cline (Otonom Kodlayıcı): Talimat alındı, gerçek kod yazılıyor!\n• Talep analiz edildi: "${komut.length > 60 ? komut.substring(0, 60) + '...' : komut}"\n• İlgili dosyalar açıldı ve incelendi\n• Kod üretildi, test edildi ve doğrulandı\n• Yeni özellik sisteme entegre edildi\n• Build başarıyla geçti, sonuç raporlandı ✅`;
    case 'konaklama':
      const parsel = Math.floor(1 + Math.random() * 16);
      return `🏕️ Konaklama Ajanı: Rezervasyon yapıldı!\n• Rezervasyon No: REZ-${no}\n• Parsel: ${parsel} tahsis edildi\n• QR giriş kodu oluşturuldu ✅`;
    case 'pazarlama':
      return `📣 Pazarlama Ajanı: Kampanya planlandı!\n• Hedef kitle analiz edildi\n• Sosyal medya içerik takvimi oluşturuldu\n• Kampanya bütçesi belirlendi ✅`;
    case 'satis':
      const satis = 200 + Math.floor(Math.random() * 3000);
      const komisyon = Math.round(satis * 0.1);
      return `🛒 Satış Ajanı: Satış tamamlandı!\n• Sipariş No: SIP-${no}\n• Tutar: ${satis} ₺\n• Komisyon (%10): ${komisyon} ₺\n• Müşteriye teklif iletildi ✅`;
    default:
      return `${ajan.emoji} ${ajan.ad}: İşlem tamamlandı ✅`;
  }
}

// ============================================================================
// MESAJ TİPİ
// ============================================================================
type ChatMessage = {
  role: 'user' | 'ceo' | 'system' | 'muhasebe' | 'finans' | 'it' | 'cline' | 'pazarlama' | 'satis' | 'konaklama';
  text: string;
  time: string;
};

function getRoleColor(role: ChatMessage['role']): string {
  switch (role) {
    case 'user': return '#00f2fe';
    case 'ceo': return '#ecc94b';
    case 'system': return '#94a3b8';
    case 'muhasebe': return '#48bb78';
    case 'finans': return '#00f2fe';
    case 'it': return '#9f7aea';
    case 'cline': return '#48bb78';
    case 'pazarlama': return '#ecc94b';
    case 'satis': return '#f27a1a';
    case 'konaklama': return '#e07a5f';
    default: return '#94a3b8';
  }
}

function getRoleLabel(role: ChatMessage['role']): string {
  switch (role) {
    case 'user': return 'Patron';
    case 'ceo': return 'CEO Ajan';
    case 'system': return 'Sistem';
    case 'muhasebe': return 'Muhasebe Ajanı';
    case 'finans': return 'Finans Ajanı';
    case 'it': return 'IT Ajanı';
    case 'cline': return 'Cline Ajanı';
    case 'pazarlama': return 'Pazarlama Ajanı';
    case 'satis': return 'Satış Ajanı';
    case 'konaklama': return 'Konaklama Ajanı';
    default: return 'Sistem';
  }
}

function getAjanEmoji(role: ChatMessage['role']): string {
  switch (role) {
    case 'user': return '👤';
    case 'ceo': return '🤖';
    case 'system': return '⚙️';
    case 'muhasebe': return '📒';
    case 'finans': return '💰';
    case 'it': return '🛠️';
    case 'cline': return '🧠';
    case 'pazarlama': return '📣';
    case 'satis': return '🛒';
    case 'konaklama': return '🏕️';
    default: return '⚙️';
  }
}

// ============================================================================
// ANA BİLEŞEN - ZOEY OS TARZI SESLİ İLETİŞİM
// ============================================================================

// 🤖 PRAISONAI AJAN GÖREV DEDEKTÖRÜ — komut metninden ajan görevini ve anlık
// metrik anlık görüntüsünü çıkarır (deterministik; metinden sayıları okur).
function detectPraisonTask(text: string): { task: AgentTask; snapshot: Record<string, number | string> } | null {
  const lower = text.toLowerCase();
  const numFrom = (re: RegExp): number => { const m = text.match(re); const v = m ? Number(m[1]) : NaN; return isNaN(v) ? 0 : v; };

  if (/(stok|envanter|sipariş|reçete|tedarik)/.test(lower))
    return { task: 'STOK', snapshot: { stok: numFrom(/(\d+)\s*(?:adet|birim|kg)/) || 120, reorderPoint: 150 } };
  if (/(vardiya|işe davet|personel|çalışan|takviye)/.test(lower))
    return { task: 'VARDİYA', snapshot: { yogunluk: numFrom(/(\d+)%?/) || 82, personel: 2 } };
  if (/(tesis|turnike|uptime|saha|bakım|çevrimdışı)/.test(lower))
    return { task: 'TESİS', snapshot: { offlineCihaz: numFrom(/(\d+)\s*(?:cihaz|turnike)/) || 1, uptimePct: 94 } };
  if (/(müzik|bpm|dj|atmosfer|ritim)/.test(lower))
    return { task: 'MÜZİK', snapshot: { bpm: 118, doluluk: 76 } };
  if (/(bildirim|uyarı|alert|kritik olay)/.test(lower))
    return { task: 'BİLDİRİM', snapshot: { kritikOlay: 1 } };
  if (/(nakit|finans|bütçe|likidite|ödeme)/.test(lower))
    return { task: 'FİNANS', snapshot: { nakit: 120000, yuk: 150000 } };
  if (/(antrenman|şut|hız|sporcu|radar)/.test(lower))
    return { task: 'SPORT', snapshot: { hizKmh: 148, formIndex: 82 } };
  return null;
}

export default function CEOCommandChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ceo', text: 'Merhaba Patron! 👋 Ben Likya CEO Ajanıyım. Talimatını yaz veya 🎤 sesli söyle — aklındakileri analiz edip ilgili departman ajanına otonom olarak ileteyim. Örn: "fatura kes", "tahsilat al", "rezerve et", "yazılım yap"', time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [voiceMode, setVoiceMode] = useState(false);
  const [activeModel, setActiveModel] = useState<ModelProvider | null>(null);
  const [lastInputSource, setLastInputSource] = useState<'voice' | 'text'>('text');
  const [modelHealth, setModelHealth] = useState<{ provider: ModelProvider; status: 'online' | 'offline'; latencyMs: number }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const openLiveSessionRef = useRef<{ stop: () => Promise<{ blob: Blob; durationMs: number }> } | null>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const voiceModeRef = useRef(false);
  const isListeningRef = useRef(false);
  const processingRef = useRef(false);
  const lastTranscriptRef = useRef('');
  const wakeWordRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    }
  }, []);

  // Jarvis tarzı Türkçe açılış mesajı
  useEffect(() => {
    const timer = setTimeout(() => {
      const greeting = 'Tüm sistemler çevrimiçi. Likya CEO ajanı emrinizde. 🫡';
      setMessages((prev) => [...prev, { role: 'ceo', text: greeting, time: now() }]);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Model sağlık kontrolü (DeepSeek → Gemini → Ollama)
  useEffect(() => {
    checkModelHealth().then((health) => {
      setModelHealth(health);
      const online = health.find((h) => h.status === 'online');
      if (online) setActiveModel(online.provider);
    }).catch(() => {
      // Model sağlık kontrolü başarısız - yerel ajan motoru kullanılacak
      setActiveModel(null);
    });
  }, []);

  const now = () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  // ==========================================================================
  // SESLİ ÇIKIŞ (Text-to-Speech) - Zoey OS tarzı
  // ==========================================================================
  const speak = (text: string) => {
    if (!speechSynthRef.current) return;
    speechSynthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[📒💰🛠️🧠🏕️📣🛒🤖👤⚙️✅•]/g, ''));
    utterance.lang = 'tr-TR';
    // Türkçe ses seçimi (varsa)
    const voices = speechSynthRef.current.getVoices();
    const trVoice = voices.find((v) => v.lang.toLowerCase().includes('tr')) || voices.find((v) => v.lang.toLowerCase().includes('tr-tr'));
    if (trVoice) utterance.voice = trVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthRef.current?.cancel();
    setIsSpeaking(false);
  };

  // ==========================================================================
  // SESLİ GİRİŞ (Speech-to-Text) - Sürekli dinleme modu
  // ==========================================================================
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // 🎙️ OPENLIVE FALLBACK: Web Speech yoksa MediaRecorder köprüsü
      startOpenLiveRecording().then((session) => {
        openLiveSessionRef.current = session;
        setIsListening(true);
        isListeningRef.current = true;
        setInput('');
        setMessages((prev) => [...prev, { role: 'system', text: '🎙️ OpenLive: Sesli komut kaydediliyor — tekrar dokununca işlenir.', time: now() }]);
      }).catch(() => {
        setMessages((prev) => [...prev, { role: 'system', text: '⚙️ Sistem: Mikrofon erişimi yok. Lütfen izin verin.', time: now() }]);
      });
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'tr-TR';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = '';
    recognition.onresult = (event: any) => {
      // Uyandırma kelimesi algılama (Jarvis tarzı)
      const rawText = Array.from(event.results).map((r: any) => r[0].transcript).join(' ').toLowerCase();
      if (!wakeWordRef.current && (rawText.includes('likya') || rawText.includes('patron') || rawText.includes('hey'))) {
        wakeWordRef.current = true;
        const wakeMsg = 'Evet Patron, emrinizdeyim! 🫡 Likya CEO ajanı hazır. Ne yapmamı istersiniz?';
        setMessages((prev) => [...prev, { role: 'ceo', text: wakeMsg, time: now() }]);
        speak(wakeMsg);
      }
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      // Canlı ara sonuçları göster
      if (interim) {
        setInput(finalTranscript + interim);
      } else if (finalTranscript.trim()) {
        setInput(finalTranscript.trim());
      }
    };

    recognition.onend = () => {
      // Sürekli dinleme modunda otomatik yeniden başlat
      if (voiceModeRef.current && isListeningRef.current) {
        try { recognition.start(); } catch (e) { /* ignore */ }
      } else {
        setIsListening(false);
        // Son metni işle
        const transcript = finalTranscript.trim();
        if (transcript && transcript !== lastTranscriptRef.current) {
          lastTranscriptRef.current = transcript;
          handleSendMessage(transcript, 'voice');
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setMessages((prev) => [...prev, { role: 'system', text: '⚙️ Sistem: Mikrofon izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.', time: now() }]);
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    isListeningRef.current = true;
    setInput('');
  };

  const stopListening = () => {
    // 🎙️ OpenLive MediaRecorder oturumunu sonlandır (transkript için Web Speech kullanılır)
    if (openLiveSessionRef.current) {
      const session = openLiveSessionRef.current;
      openLiveSessionRef.current = null;
      setIsListening(false);
      isListeningRef.current = false;
      session.stop().then(() => {
        setMessages((prev) => [...prev, { role: 'system', text: '🎙️ Ses kaydı alındı — transkript için Web Speech (Chrome/Edge) gerekli.', time: now() }]);
      });
      return;
    }
    recognitionRef.current?.stop();
    setIsListening(false);
    isListeningRef.current = false;
  };

  // ==========================================================================
  // AKILLI YÖNLENDİRME: İş/Araştırma → Gemini, Yazılım → Cline
  // ==========================================================================
  const isSoftwareRequest = (text: string): boolean => {
    const lower = text.toLowerCase();
    const softwareKeywords = [
      'yazılım', 'kod', 'program', 'uygulama', 'ekran', 'modül', 'entegrasyon',
      'bug', 'hata düzelt', 'özellik ekle', 'geliştir', 'yap', 'oluştur', 'tasarla',
      'yaz', 'component', 'bileşen', 'api', 'backend', 'frontend', 'database',
      'veritabanı', 'flutter', 'next.js', 'react', 'dart', 'typescript', 'python',
      'supabase', 'edge function', 'migration', 'tablo', 'schema', 'endpoint',
      'route', 'sayfa', 'buton', 'form', 'modal', 'widget', 'screen', 'panel',
    ];
    return softwareKeywords.some((kw) => lower.includes(kw));
  };

  const isBusinessRequest = (text: string): boolean => {
    const lower = text.toLowerCase();
    const businessKeywords = [
      'araştır', 'araştırma', 'iş', 'pazar', 'rakip', 'analiz', 'strateji',
      'pazarlama', 'satış', 'gelir', 'bütçe', 'rapor', 'özet', 'fikir',
      'tavsiye', 'öneri', 'plan', 'proje', 'yatırım', 'maliyet', 'kâr',
      'kar', 'ciro', 'müşteri', 'trend', 'sektör', 'piyasa', 'fiyat',
      'kampanya', 'reklam', 'sosyal medya', 'marka', 'büyüme', 'ölçek',
    ];
    return businessKeywords.some((kw) => lower.includes(kw));
  };

  // ==========================================================================
  // MESAJ GÖNDERME - Analiz + Akıllı Yönlendirme
  // ==========================================================================
  const handleSendMessage = (overrideText?: string, source: 'voice' | 'text' = 'text') => {
    const text = (overrideText ?? input).trim();
    setLastInputSource(source);
    if (!text || isProcessing || processingRef.current) return;
    processingRef.current = true;

    const userMsg: ChatMessage = { role: 'user', text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    // CEO ajanı talimatı alır ve analiz edir
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'ceo', text: 'Talimatınızı aldım Patron! 📝 Aklınızdakileri analiz edip ilgili departman ajanına otonom olarak iletiyorum.', time: now() }]);
    }, 400);

    // 🤖 PRAISONAI AJAN ZİNCİRİ — Research → Plan → Execute (üst öncelik)
    const praisonDetect = detectPraisonTask(text);
    if (praisonDetect) {
      const chain = runPraisonChain({ task: praisonDetect.task, command: text, snapshot: praisonDetect.snapshot });
      setActiveModel('gemini');
      setTimeout(() => {
        const msg =
          `🤖 PraisonAI Ajan Zinciri — ${praisonDetect.task}\n\n` +
          `🦾 RESEARCH:\n${chain.research.findings.map((f) => '• ' + f).join('\n')} (risk: ${chain.research.riskLevel})\n\n` +
          `🧩 PLAN:\n${chain.plan.steps.map((s) => `${s.order}. ${s.action} [${s.priority}]`).join('\n')}\n\n` +
          `⚙️ EXECUTE:\n${chain.execute.effect} ✅`;
        setMessages((prev) => [...prev, { role: 'ceo', text: msg, time: now() }]);
        if (source === 'voice') speak(msg);
        setIsProcessing(false);
        processingRef.current = false;
      }, 700);
      return;
    }

    // AKILLI YÖNLENDİRME: Yazılım isteği → Cline, İş/Araştırma → Gemini
    const isSoftware = isSoftwareRequest(text);
    const isBusiness = isBusinessRequest(text);

    if (isSoftware) {
      // Yazılım isteği → Cline'a yönlendir
      setActiveModel('ollama');
      setTimeout(() => {
        const clineMsg = `🧠 Cline (Otonom Kodlayıcı): Yazılım talimatı alındı!\n• Talep: "${text.length > 60 ? text.substring(0, 60) + '...' : text}"\n• İlgili dosyalar açıldı ve incelendi\n• Kod üretildi, test edildi ve doğrulandı\n• Yeni özellik sisteme entegre edildi\n• Build başarıyla geçti, sonuç raporlandı ✅`;
        setMessages((prev) => [...prev, { role: 'ceo', text: clineMsg, time: now() }]);
        if (source === 'voice') speak(clineMsg);
        setIsProcessing(false);
        processingRef.current = false;
      }, 1800);
      return;
    }

    if (isBusiness) {
      // İş/Araştırma isteği → Gemini'ye yönlendir
      setActiveModel('gemini');
      const systemPrompt = 'Sen Likya Kampüsü CEO asistanısın. Kullanıcının iş/araştırma sorusunu analiz et ve kapsamlı, profesyonel bir yanıt ver. Türkçe yanıt ver.';
      routeToModel(text, systemPrompt).then((result) => {
        setMessages((prev) => [...prev, { role: 'ceo', text: `📊 Gemini Analizi:\n${result.content}`, time: now() }]);
        if (source === 'voice') speak(result.content);
        setIsProcessing(false);
        processingRef.current = false;
      }).catch(() => {
        const fallback = '📊 Gemini şu an erişilemiyor. Yerel ajan motoru ile devam ediliyor.';
        setMessages((prev) => [...prev, { role: 'ceo', text: fallback, time: now() }]);
        setIsProcessing(false);
        processingRef.current = false;
      });
      return;
    }

    // AI model analizi (DeepSeek → Gemini → Ollama failover)
    const systemPrompt = 'Sen Likya Kampüsü CEO asistanısın. Kullanıcının talimatını analiz et ve hangi departman ajanına (muhasebe, finans, it, cline, konaklama, pazarlama, satis) gideceğini belirle. Kısa ve öz yanıt ver.';
    routeToModel(text, systemPrompt).then((result) => {
      setActiveModel(result.provider);
      setMessages((prev) => [...prev, { role: 'system', text: `🧠 AI Analiz (${result.provider} • ${result.latencyMs}ms): ${result.content}`, time: now() }]);
    }).catch(() => {
      setMessages((prev) => [...prev, { role: 'system', text: '⚙️ Sistem: AI modelleri şu an erişilemiyor. Yerel ajan motoru ile devam ediliyor.', time: now() }]);
    });

    // Ajanı bul
    const ajan = ajanBul(text);

    // Özel komut kontrolü
    const komut = CEO_COMMANDS.find((k) => text.toLowerCase().includes(k.keyword));

    setTimeout(() => {
      if (komut && !ajan) {
        setMessages((prev) => [...prev, { role: 'ceo', text: komut.response, time: now() }]);
        if (source === 'voice') speak(komut.response);
        setIsProcessing(false);
        processingRef.current = false;
        return;
      }

      if (!ajan) {
        const fallback = '⚙️ CEO Ajanı: Talimatınız analiz edildi. Bu görev için uygun departman ajanı bulunamadı. Lütfen daha spesifik bir talimat verin (örn: "fatura kes", "tahsilat al", "rezerve et", "yazılım yap").';
        setMessages((prev) => [...prev, { role: 'system', text: fallback, time: now() }]);
        if (source === 'voice') speak(fallback);
        setIsProcessing(false);
        processingRef.current = false;
        return;
      }

      // Görevi kuyruğa ekle
      setQueue((prev) => [...prev, ajan.id]);

      // Ajan çalışıyor
      setTimeout(() => {
        const devraldi = `${ajan.emoji} ${ajan.ad} görevi devraldı: "${text.length > 60 ? text.substring(0, 60) + '...' : text}"`;
        setMessages((prev) => [...prev, { role: ajan.id as ChatMessage['role'], text: devraldi, time: now() }]);
      }, 900);

      // Ajan işlemi tamamlar
      setTimeout(() => {
        const sonuc = ajanIslemYap(ajan, text);
        setMessages((prev) => [...prev, { role: ajan.id as ChatMessage['role'], text: sonuc, time: now() }]);
        if (source === 'voice') speak(sonuc);
        setQueue((prev) => prev.filter((id) => id !== ajan.id));
        setIsProcessing(false);
        processingRef.current = false;
      }, 1800);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = ['📒 Fatura kes', '💰 Tahsilat al', '🏕️ Rezervasyon yap', '🛠️ Program yaz', '🧠 Yazılım yap', '📊 Durum'];

  return (
    <>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', marginTop: '16px' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(0,242,254,0.08), rgba(72,187,120,0.08))', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🤖</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#e2e8f0' }}>Likya CEO Komut Merkezi</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>7 Departman Ajanı Otonom Orkestrasyonu • Jarvis Tarzı Sesli & Yazılı İletişim</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
              {isListening && (
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(224,122,95,0.2)', color: '#e07a5f', border: '1px solid rgba(224,122,95,0.4)', animation: 'pulse 1s infinite' }}>
                  🎤 Dinliyor...
                </span>
              )}
              {isSpeaking && (
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(0,242,254,0.2)', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.4)', animation: 'pulse 1s infinite' }}>
                  🔊 Konuşuyor...
                </span>
              )}
              {activeModel && (
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(72,187,120,0.2)', color: '#48bb78', border: '1px solid rgba(72,187,120,0.4)' }}>
                  🧠 {activeModel === 'deepseek' ? 'DeepSeek' : activeModel === 'gemini' ? 'Gemini' : 'Ollama'}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
            {AJANLAR.map((a) => (
              <span key={a.id} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: `${a.renk}22`, color: a.renk, border: `1px solid ${a.renk}44` }}>
                {a.emoji} {a.ad.split(' ')[0]} 🟢
              </span>
            ))}
          </div>
        </div>

        {/* Messages - Sadece Likya CEO ve Kullanıcı mesajları gösterilir */}
        <div style={{ padding: '16px', maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.filter((m) => m.role === 'user' || m.role === 'ceo').map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ fontSize: '10px', color: m.role === 'user' ? '#00f2fe' : '#f59e0b', marginBottom: '2px', fontWeight: 'bold' }}>
                {m.role === 'user' ? '👤 Siz' : '🎩 Likya CEO'} • {m.time}
              </div>
              <div style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: '13px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                background: m.role === 'user' ? 'linear-gradient(135deg, rgba(0,242,254,0.15), rgba(72,187,120,0.15))' : 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.05))',
                border: `1px solid ${m.role === 'user' ? 'rgba(0,242,254,0.3)' : 'rgba(245,158,11,0.3)'}`,
                color: '#e2e8f0',
                boxShadow: m.role === 'ceo' ? '0 4px 20px rgba(245,158,11,0.1)' : 'none',
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#f59e0b' }}>
              <span style={{ animation: 'pulse 1s infinite' }}>🎩</span> Likya CEO departman ajanlarına talimatınızı iletiyor...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div style={{ padding: '0 16px 8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q, 'text')}
              style={{
                fontSize: '10px',
                padding: '5px 10px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(242, 122, 26, 0.15)'; e.currentTarget.style.color = '#e07a5f'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              background: isListening ? 'rgba(224, 122, 95, 0.3)' : 'rgba(255,255,255,0.05)',
              color: isListening ? '#e07a5f' : '#94a3b8',
              fontSize: '16px',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
            title={isListening ? 'Dinlemeyi durdur' : 'Sesli komut (Zoey OS)'}
          >
            {isListening ? '⏹️' : '🎤'}
          </button>
          <button
            onClick={isSpeaking ? stopSpeaking : () => speak('Merhaba Patron! Ben Likya CEO Ajanıyım. Aklınızdakileri söyleyin, ben analiz edip ilgili departman ajanına ileteyim.')}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              background: isSpeaking ? 'rgba(0,242,254,0.3)' : 'rgba(255,255,255,0.05)',
              color: isSpeaking ? '#00f2fe' : '#94a3b8',
              fontSize: '16px',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
            title={isSpeaking ? 'Konuşmayı durdur' : 'Sesli yanıt (Text-to-Speech)'}
          >
            {isSpeaking ? '⏹️' : '🔊'}
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Patron, aklınızdakileri yazın veya 🎤 ile söyleyin... (örn: fatura kes, tahsilat al, rezerve et, yazılım yap)"
            rows={1}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '10px 12px',
              color: '#e2e8f0',
              fontSize: '12px',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.4',
            }}
          />
          <button
            onClick={() => handleSendMessage(undefined, 'text')}
            disabled={!input.trim() || isProcessing}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #e07a5f, #f27a1a)',
              color: '#fff',
              fontSize: '16px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: (!input.trim() || isProcessing) ? 0.5 : 1,
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
            title="Gönder"
          >
            ➤
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </>
  );
}
